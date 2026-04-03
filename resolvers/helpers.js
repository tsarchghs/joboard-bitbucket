const sanitizeUser = (user) => {
	if (!user) {
		return user;
	}

	return {
		...user,
		password: null
	};
};

const createJobTypesWrite = (jobTypes = []) => ({
	create: jobTypes.map((type) => ({ type }))
});

const replaceJobTypesWrite = (jobTypes = []) => ({
	deleteMany: {},
	create: jobTypes.map((type) => ({ type }))
});

const getJobTypes = async (context, job) => {
	if (!job) {
		return [];
	}

	if (Array.isArray(job.job_types)) {
		return job.job_types;
	}

	if (Array.isArray(job.job_types_rel)) {
		return job.job_types_rel.map((entry) => entry.type);
	}

	const rows = await context.db.jobTypeOnJob.findMany({
		where: { jobId: job.id },
		select: { type: true }
	});

	return rows.map((entry) => entry.type);
};

const buildJobWhere = (jobFilter = {}) => {
	const and = [];

	if (jobFilter.category) {
		and.push({ category: jobFilter.category });
	}

	if (jobFilter.location) {
		and.push({ location: { contains: jobFilter.location } });
	}

	if (jobFilter.remote) {
		and.push({ remote: jobFilter.remote });
	}

	if (jobFilter.keywords) {
		and.push({ position: { contains: jobFilter.keywords } });
	}

	if (jobFilter.status_type) {
		and.push({ status: jobFilter.status_type });
	}

	if (jobFilter.createdAt_gte) {
		and.push({ createdAt: { gte: new Date(jobFilter.createdAt_gte) } });
	}

	if (jobFilter.createdAt_lte) {
		and.push({ createdAt: { lte: new Date(jobFilter.createdAt_lte) } });
	}

	if (jobFilter.id_not_in && jobFilter.id_not_in.length) {
		and.push({ id: { notIn: jobFilter.id_not_in } });
	}

	if (jobFilter.status_not_in && jobFilter.status_not_in.length) {
		and.push({ status: { notIn: jobFilter.status_not_in } });
	}

	if (jobFilter.city) {
		and.push({ cityId: jobFilter.city });
	}

	if (jobFilter.job_types && jobFilter.job_types.length) {
		jobFilter.job_types.forEach((type) => {
			and.push({
				job_types_rel: {
					some: { type }
				}
			});
		});
	}

	if (!and.length) {
		return {};
	}

	return { AND: and };
};

module.exports = {
	buildJobWhere,
	createJobTypesWrite,
	getJobTypes,
	replaceJobTypesWrite,
	sanitizeUser
};
