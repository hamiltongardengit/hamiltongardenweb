
const getSortOptions = (type, field) => {
    const sortField = field; // Field to sort by
    const sortOrder = type; // Ascending or descending order
    
    return { [sortField]: sortOrder };
};

module.exports = { getSortOptions };