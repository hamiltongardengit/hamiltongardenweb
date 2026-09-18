const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: Number,
        unique: true,
        // required: [true, 'Invoice number is required.']
    },
    invoiceType: {
        type: String,
        enum: {
            values: ['Invoice', 'Debit Note'],
            message: 'Payment status must be either Invoice or Debit Note.'
        },
        default: 'Invoice'
    },
    membershipNumber: {
        type: Number,
        unique: true,
        // required: [true, 'Membership number is required.']
    },
    customer: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Assuming you have a User model
            // required: true,
        },
        name: {
            type: String,
            required: [true, 'Customer name is required.']
        },
        email: {
            type: String,
            required: [true, 'Customer email is required.'],
            match: [/.+\@.+\..+/, 'Please fill a valid email address.']
        },
        address: {
            type: String,
            required: [true, 'Customer address is required.']
        },
        contactNumber: {
            type: String,
            required: [true, 'Customer contact number is required.'],
            // match: [/^\d{10}$/, 'Please fill a valid contact number.']
        },
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    items: [
        {
            quantity: {
                type: Number,
                required: [true, 'Item quantity is required.'],
                min: [1, 'Item quantity must be at least 1.']
            },
            service: {
                type: String,
                required: [true, 'Service name is required.']
            },
            price: {
                type: Number,
                required: [true, 'Service price is required.'],
                min: [0, 'Service price cannot be negative.']
            },
            taxAmount: {
                type: Number,
                required: [true, 'Tax amount is required.'],
                min: [0, 'Tax amount cannot be negative.']
            },
            subtotal: {
                type: Number,
                required: [true, 'Item subtotal is required.'],
                min: [0, 'Subtotal cannot be negative.']
            }
        }
    ],
    taxRate: {
        type: Number,
        required: [true, 'Tax rate is required.'],
        min: [0, 'Tax rate cannot be negative.']
    },
    discountRate: {
        type: Number,
        min: [0, 'Discount rate cannot be negative.']
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required.'],
        min: [0, 'Subtotal cannot be negative.']
    },
    totalTaxAmount: {
        type: Number,
        required: [true, 'Total tax amount is required.'],
        min: [0, 'Total tax amount cannot be negative.']
    },
    discountAmount: {
        type: Number,
        min: [0, 'Discount amount cannot be negative.']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required.'],
        min: [0, 'Total amount cannot be negative.']
    },
    paidAmount: {
        type: Number,
        required: [true, 'Paid amount is required.'],
        min: [0, 'Paid amount cannot be negative.']
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['Cash', 'Cheque', 'UPI', 'Credit/Debit Card'],
            message: 'Payment method must be either Cash, Cheque, UPI, Credit/Debit Card.'
        },
        default: 'Credit/Debit Card'
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ['Pending', 'Paid', 'Overdue'],
            message: 'Payment status must be either Pending, Paid, or Overdue.'
        },
        default: 'Pending'
    },
    notes: String,
    pdfDetails: {
        public_id: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        }
    },
    membership: {
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        renewalStatus: {
            type: String,
            enum: ["Active", "Expired", "Renewed", "Pending Renewal"],
            default: "Active",
        },
        remindersSent: [
            {
                reminderDate: Date,
                type: {
                    type: String,
                    enum: ["Email", "SMS", "WhatsApp"],
                    default: "Email",
                },
            },
        ],
    },    
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Reference to the User who created this
    },

});

// Auto-increment plugin for numeric fields
invoiceSchema.plugin(AutoIncrement, {
    inc_field: 'invoiceNumber',
    id: 'invoiceNumberSeq',
    // prefix: 'INV-',
    start_seq: 100
});
// invoiceSchema.plugin(AutoIncrement, {
//     inc_field: 'membershipNumber',
//     id: 'membershipNumberSeq',
//     // prefix: 'MEM-',
//     start_seq: 100
// });

module.exports = mongoose.model('Invoice', invoiceSchema);
