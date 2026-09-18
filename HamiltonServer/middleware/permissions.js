// permissions.js
const permissions = {
    user: {
        ui: ["/dashboard", "/profile"],
        api: ["getUserDetails", "updateProfile"]
    },
    employee: {
        ui: ["/employee-dashboard", "/customer-list"],
        api: ["get-all-users", "assignCustomersToEmployee"]
    },
    employee_view: {
        ui: ["/employee-dashboard", "/customer-list"],
        api: ["get-all-users", "assignCustomersToEmployee"]
    },
    admin: {
        ui: ["/admin-dashboard", "/user-management", "search-hotels"],
        api: ["get-all-users", "updateUserRole", "deleteUser", "search-hotels", "hotel-info", "search-cities", "search-hotels-by-city", "pre-book", "book", "booking-details", "bookings", "booking"]
    },
    tbo_admin: {
        ui: ["/admin-dashboard", "/user-management", "search-hotels"],
        api: ["search-hotels", "hotel-info", "search-cities", "search-hotels-by-city", "pre-book", "book", "booking-details", "bookings", "booking"]
    },
    temp_admin: {
        ui: ["/admin", "/destination/list", "/invoice/list", "user/list", ],
        api: ["getAllUsers"]
    },
    super_admin: {
        ui: ["*"],
        api: ["*"]
    }
};


const collectUIPermissions = (roles) => {
    if (!roles || !Array.isArray(roles)) return [];
    let allowedUI = [];
    roles.forEach(role => {
        if (permissions[role]) {
            allowedUI = [...allowedUI, ...permissions[role].ui];
        }
    });
    if (allowedUI.includes("*")) return ["*"];
    return [...new Set(allowedUI)]; // remove duplicates
};

const collectAPIPermissions = (roles) => {
    if (!roles || !Array.isArray(roles)) return [];
    let allowedAPI = [];
    roles.forEach(role => {
        if (permissions[role]) {
            allowedAPI = [...allowedAPI, ...permissions[role].api];
        }
    });
    if (allowedAPI.includes("*")) return ["*"];
    return [...new Set(allowedAPI)]; // remove duplicates
};

module.exports = { permissions, collectUIPermissions, collectAPIPermissions };
