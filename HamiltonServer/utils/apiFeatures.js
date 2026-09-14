class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // Search functionality
    search() {
        const keyword = this.queryStr.keyword?.trim() ? {
            $or: [
                { name: { $regex: this.queryStr.keyword, $options: "i" } },
                { description: { $regex: this.queryStr.keyword, $options: "i" } },
                { firstname: { $regex: this.queryStr.keyword, $options: "i" } },
                { lastname: { $regex: this.queryStr.keyword, $options: "i" } },
                { email: { $regex: this.queryStr.keyword, $options: "i" } },
                { role: { $regex: this.queryStr.keyword, $options: "i" } },
                { city: { $regex: this.queryStr.keyword, $options: "i" } },
                { "customer.name": { $regex: this.queryStr.keyword, $options: "i" } },
                { "customer.description": { $regex: this.queryStr.keyword, $options: "i" } },
                { "customer.firstname": { $regex: this.queryStr.keyword, $options: "i" } },
                { "customer.lastname": { $regex: this.queryStr.keyword, $options: "i" } },
                { "customer.email": { $regex: this.queryStr.keyword, $options: "i" } },
                { "reviews.createdBy": { $regex: this.queryStr.keyword, $options: "i" } },
            ]
        } : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    // Filter functionality
    filter() {
        const queryCopy = { ...this.queryStr };

        // Removing fields not meant for filtering
        const removeFields = ["keyword", "current_page", "limit", "pagesize"];
        removeFields.forEach(key => delete queryCopy[key]);

        // Convert operators to MongoDB format
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // Pagination functionality
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.current_page) || 1; // Consistent naming
        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }

    // Sorting functionality
    sort(type = -1, field = 'createdAt') {
        const sortOptions = this.getSortOptions(type, field); // Use model-specific defaults
        this.query = this.query.sort(sortOptions);
        return this;
    }

    getSortOptions(type, field) {
        return { [field]: type };
    }
}

module.exports = ApiFeatures;