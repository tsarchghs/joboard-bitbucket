require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { GraphQLServer } = require("graphql-yoga");
const { static } = require("express");
const compression = require("compression");
const cron = require("node-cron");
const htmlToText = require("html-to-text");
const jwt = require("jsonwebtoken");
const logger = require("morgan");

const configs = require("./configs");
const prismaDb = require("./prisma/client");
const resolvers = require("./resolvers");
const { sanitizeUser } = require("./resolvers/helpers");

const isVercel = Boolean(process.env.VERCEL);
const shouldRunCron = !isVercel && require.main === module;
const shouldServeClient =
  isVercel ||
  process.env.production === "true" ||
  process.env.PRODUCTION === "true" ||
  process.env.NODE_ENV === "production";
const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || (isVercel ? "/api/graphql" : "/");
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT) || 4001;
const schemaPath = path.join(__dirname, "schema.graphql");
const typeDefs = fs.readFileSync(schemaPath, "utf8");

function resolveClientPath() {
  const publicPath = path.join(__dirname, "public");
  const publicIndexPath = path.join(publicPath, "index.html");

  if (fs.existsSync(publicIndexPath)) {
    return publicPath;
  }

  return path.join(__dirname, "client", "build");
}

function daysDifference(date1, date2) {
  const timeDiff = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

const clientPath = resolveClientPath();
const clientIndexPath = path.join(clientPath, "index.html");

if (shouldRunCron) {
  cron.schedule("0 */30 * * * *", async () => {
    console.log("STARTED");
    const today = Date.now();
    const jobs = await prismaDb.job.findMany({
      where: { status: { not: "CLOSED" } },
    });

    for (const job of jobs) {
      const jobExpiresAt = new Date(job.expiresAt).getTime();
      let newStatus;
      const daysDiff = daysDifference(new Date(today), new Date(jobExpiresAt));

      if (jobExpiresAt < today) {
        console.log(today, jobExpiresAt, 123);
        newStatus = "CLOSED";
      } else if (daysDiff < 23 && job.status !== "FEATURED") {
        newStatus = "MONTH";
      } else if (daysDiff < 30 && job.status !== "FEATURED") {
        newStatus = "WEEK";
      }

      console.log(job.id, "---", daysDiff, "---", newStatus);
      if (newStatus !== undefined && newStatus !== job.status) {
        await prismaDb.job.update({
          where: { id: job.id },
          data: {
            status: newStatus,
          },
        });
      }
    }
  });
}

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: async (req) => {
    let user;

    if (req.request.headers.authorization) {
      const token = req.request.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token, configs.jwt_secret);
        if (decoded.userId) {
          user = await prismaDb.user.findUnique({
            where: { id: decoded.userId },
          });
        }
      } catch (error) {
        user = undefined;
      }
    }

    return {
      req,
      user: sanitizeUser(user),
      db: prismaDb,
    };
  },
});

if (shouldServeClient) {
  server.express.use(logger("dev"));
  server.express.use(compression());

  server.express.use((req, res, next) => {
    const protocol = req.get("x-forwarded-proto");
    if (process.env.REDIRECT_TO_HTTPS && protocol && protocol !== "https") {
      return res.redirect(`${process.env.REDIRECT_TO_HTTPS}${req.url}`);
    }
    next();
  });

  server.express.use(static(clientPath, { index: false }));

  server.express.get("*", async (req, res, next) => {
    if (
      graphqlEndpoint !== "/" &&
      (req.path === graphqlEndpoint || req.path.startsWith(`${graphqlEndpoint}/`))
    ) {
      return next();
    }

    const splitted = req.originalUrl.split("/");
    let job;

    if (splitted[1] === "job") {
      job = await prismaDb.job.findUnique({
        where: { id: splitted[2] },
        include: {
          company_logo: true,
          company: {
            include: {
              logo: true,
            },
          },
        },
      });
    }

    fs.readFile(clientIndexPath, "utf8", (err, htmlData) => {
      if (err) {
        console.log(err);
        return res.status(404).end();
      }

      const publicData = {
        logo_url: process.env.LOGO_URL,
        domain: process.env.DOMAIN,
        head_title: process.env.HEAD_TITLE,
        website_name: process.env.WEBSITE_NAME,
        find_only_text: process.env.FIND_ONLY_TEXT,
        below_find_only_html: process.env.BELOW_FIND_ONLY_HTML,
        twitter: process.env.TWITTER,
        email: process.env.EMAIL,
        favicon_path: process.env.FAVICON_PATH,
        domain_svg: process.env.DOMAIN_SVG,
        apollo_client_uri: process.env.APOLLO_CLIENT_URI || graphqlEndpoint,
        above_job_position_text: process.env.ABOVE_JOB_POSITION_TEXT,
        use_predefined_location: process.env.USE_PREDEFINED_LOCATION,
        use_keywords: process.env.USE_KEYWORDS,
        use_location: process.env.USE_LOCATION,
        use_categories: process.env.USE_CATEGORIES,
        default_city: process.env.DEFAULT_CITY,
        default_predefined_location: process.env.default_predefined_location,
        production_client: process.env.production_client,
      };
      const websiteName = publicData.website_name || "Flutterjobs";

      htmlData = htmlData.replace(
        "</head>",
        `
				<link rel="stylesheet" href="${process.env.EXTRA_CSS_PATH}">
				<script>
					window.__PUBLIC_DATA__=${JSON.stringify(publicData)}
				</script>
				<link rel="shortcut icon" href="${publicData.favicon_path}"/>
				</head>	
			`
      );

      if (job) {
        let logo;
      if (job.company && job.company.logo && job.company.logo.url) {
          logo = job.company.logo.url;
        } else if (job.company_logo && job.company_logo.url) {
          logo = job.company_logo.url;
        }

        return res.send(
          htmlData
            .replace("<title>", `<title>${job.position} - ${websiteName}`)
            .replace(
              "</head>",
              `
					<meta property="og:description" content="${htmlToText.fromString(job.description)}">
					${!logo ? "" : `<meta property="og:image" content="${logo}">`}
				</head>
				`
            )
        );
      }

      return res.send(htmlData.replace("<title>", `<title>${publicData.head_title}`));
    });
  });
}

const options = {
  endpoint: graphqlEndpoint,
  subscriptions: isVercel ? false : graphqlEndpoint,
  playground: isVercel ? false : graphqlEndpoint,
  port,
  host,
  bodyParserOptions: { limit: "100mb", type: "application/json" },
};

const httpServer = server.createHttpServer(options);

if (!isVercel && require.main === module) {
  httpServer.listen(options.port, options.host, () => {
    console.log(`Running on ${options.host}:${options.port}`);
  });
}

module.exports = server.express;
module.exports.graphqlServer = server;
module.exports.httpServer = httpServer;
