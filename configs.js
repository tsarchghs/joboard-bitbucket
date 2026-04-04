const env = process.env;

module.exports = {
	jwt_secret: env.JWT_SECRET || "secretShit",
	jwt_forgotPassword_secret: env.JWT_FORGOT_PASSWORD_SECRET || "uhhSoSecret",
	mailgun: {
		apiKey: env.MAILGUN_API_KEY || "DSADAS",
		domain: env.MAILGUN_DOMAIN
	},
	stripe_secret_key:
		env.STRIPE_SECRET_KEY ||
		"sk_test_51TAcLxCQPvziXDdOa8zlz2VmbA7eIAcGTkaZIZg61pxIxO7TxTL9sOr2lIWqfGUk6Rj2cO0BYxhRRZh8NHDdqU7M00JmRZRxef",
	s3: {
		bucketName: env.S3_BUCKET_NAME || "uxstories",
		accessKeyId: env.AWS_ACCESS_KEY_ID || "AKIAU7ZLBUXTEV6MN7W7",
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "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"
	},
	production: env.PRODUCTION ? env.PRODUCTION === "true" : true
};
