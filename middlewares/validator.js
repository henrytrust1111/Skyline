const joi = require("@hapi/joi");

const validateUser = (data) => {
  try {
    const validateSchema = joi.object({
      email: joi
        .string()
        .max(50)
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          "string.empty": "Email field can't be left empty",
          "any.required": "Please Email is required",
        }),
      password: joi
        .string()
        .min(8)
        .max(20)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .trim()
        .required()
        .messages({
          "string.empty": "Password field can't be left empty",
          "string.pattern.base":
            "Password must contain Lowercase, Uppercase, Numbers, and special characters",
          "string.min": "Password must be at least 8 characters long",
          "any.required": "Please password field is required",
        }),
      retypePassword: joi
        .string()
        .min(8)
        .max(20)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .valid(joi.ref("password"))
        .trim()
        .required()
        .messages({
          "string.empty": "Password field can't be left empty",
          "string.pattern.base":
            "Password must contain Lowercase, Uppercase, Numbers, and special characters",
          "string.min": "Password must be at least 8 characters long",
          "any.required": "Please password field is required",
          "any.only": "Passwords do not match",
        }),
      fullName: joi
        .string()
        .trim()
        .allow(" ", "-", "'")
        //.disallow(joi.regex.numbers())
        //.disallow(joi.regex.symbol())
        .min(3)
        .max(30)
        .required()
        .messages({
          "string.empty": "Full name cannot be empty",
          "string.min": "Full name must be at least 3 characters long",
          "string.max": "Full name cannot exceed 30 characters",
          "any.required": "Full name is required",
        }),
      username: joi
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9_]+$/)
        .min(3)
        .max(20)
        .required()
        .messages({
          "string.empty": "Username cannot be empty",
          "string.min": "Username must be at least 3 characters long",
          "string.max": "Username cannot exceed 20 characters",
          "any.required": "Username is required",
        }),
    //   gender: joi
    //     .string()
    //     .trim()
    //     .allow("Male", "Female", "Other")
    //     .insensitive()
    //     .required()
    //     .messages({
    //       "string.empty": "Gender cannot be empty",
    //       "any.required": "Gender is required",
    //       "any.only": "Gender must be Male, Female, or Other",
    //     }),
      maritalStatus: joi
        .string()
        .trim()
        .allow("Single", "Married", "Divorced")
        .insensitive()
        .required()
        .messages({
          "string.empty": "Marital status cannot be empty",
          "any.required": "Marital status is required",
          "any.only": "Marital status must be Single, Married, or Divorced",
        }),
      address: joi
        .string()
        .min(3)
        .required()
        .max(100)
        .regex(/^[a-zA-Z0-9\s_\-!@#$%^&*(),.]*$/)
        .trim()
        .messages({
          "string.empty": "Address field can't be left empty",
          "string.min": "Minimum of 3 characters for the Address field",
          "string.max": "Maximum of 100 characters long for the Address field",
          "string.pattern.base": "Please enter a valid Address",
          "any.required": "Address is required",
        }),

        occupation: joi
        .string()
        .min(3)
        .required()
        .max(100)
        .regex(/^[a-zA-Z0-9\s_\-!@#$%^&*(),.]*$/)
        .trim()
        .messages({
          "string.empty": "occupation field can't be left empty",
          "string.min": "Minimum of 3 characters for the occupation field",
          "string.max": "Maximum of 100 characters long for the occupation field",
          "string.pattern.base": "Please enter a valid occupation",
          "any.required": "occupation is required",
        }),

        accountType: joi
        .string()
        .trim()
        .allow("savings", "current")
        .insensitive()
        .required()
        .messages({
          "string.empty": "Account type cannot be empty",
          "any.required": "Account type is required",
          "any.only": "Account type must be savings or current",
        }),
        dateOfBirth: joi.date()
        .iso()
        .max('now')
        .min('1900-01-01')
        .required()
        .messages({
          'date.base': "Date of Birth must be a valid date",
          'date.iso': "Date of Birth must be in ISO format (YYYY-MM-DD)",
          'date.max': "Date of Birth cannot be in the future",
          'date.min': "Date of Birth cannot be before 1900-01-01",
          'any.required': "Date of Birth is required"
        }),

      phoneNumber: joi
        .string()
        .min(10)
        .max(15)
        .trim()
        .required()
        //.regex(/^0\d{9}$/)
        .messages({
          "string.empty": "Phone number field can't be left empty",
          "string.min": "Phone number must be atleast 10 digit long e.g: 4812345678",
          "string.max": "Phone number length must be less than or equal to 15 characters long",
          "string.pattern.base":
            "Phone number length must be less than or equal to 15 characters long",
          "any.required": "Please Phone number is required",
        }),
    });
    return validateSchema.validate(data);
  } catch (error) {
    throw error;
  }
};

const validateUserLogin = (data) => {
  try {
    const validateSchema = joi.object({
      email: joi
        .string()
        .max(50)
        .trim()
        .email({ tlds: { allow: false } })
        .messages({
          "string.empty": "Email field can't be left empty",
          "any.required": "Please Email is required",
        }),
      password: joi
        .string()
        .min(8)
        .max(20)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .trim()
        .required()
        .messages({
          "string.empty": "Password field can't be left empty",
          "string.pattern.base":
            "Password must contain Lowercase, Uppercase, Numbers, and special characters",
          "string.min": "Password must be at least 8 characters long",
          "any.required": "Please password field is required",
        }),
    });
    return validateSchema.validate(data);
  } catch (error) {
    throw error;
  }
};

const validateResetPassword = (data) => {
  try {
    const validateSchema = joi.object({
      password: joi
        .string()
        .min(8)
        .max(20)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .trim()
        .required()
        .messages({
          "string.empty": "Password field can't be left empty",
          "string.pattern.base":
            "Password must contain Lowercase, Uppercase, Numbers, and special characters",
          "string.min": "Password must be at least 8 characters long",
          "any.required": "Please password field is required",
        }),
      confirmPassword: joi
        .string()
        .min(8)
        .max(20)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .valid(joi.ref("password"))
        .trim()
        .required()
        .messages({
          "string.empty": "Password field can't be left empty",
          "string.pattern.base":
            "Password must contain Lowercase, Uppercase, Numbers, and special characters",
          "string.min": "Password must be at least 8 characters long",
          "any.required": "Please password field is required",
          "any.only": "Passwords do not match",
        }),
    });
    return validateSchema.validate(data);
  } catch (error) {
    throw error;
  }
};


const validateCardDetails = (data) => {
  try {
const cardSchema = joi.object({
  cardNumber: joi.string()
    .creditCard()
    .required()
    .messages({
      'string.base': 'Card number must be a string',
      'string.empty': 'Card number is required',
      'any.required': 'Card number is required',
      'string.creditCard': 'Card number is invalid',
    }),
  
  cardHolderName: joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.base': 'Card holder name must be a string',
      'string.empty': 'Card holder name is required',
      'string.min': 'Card holder name must be at least 3 characters',
      'string.max': 'Card holder name must be less than 50 characters',
      'any.required': 'Card holder name is required',
    }),

  expiryDate: joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)
    .required()
    .messages({
      'string.pattern.base': 'Expiry date must be in MM/YY format',
      'string.empty': 'Expiry date is required',
      'any.required': 'Expiry date is required',
    }),

  cvv: joi.string()
    .pattern(/^[0-9]{3,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'CVV must be a 3 or 4 digit number',
      'string.empty': 'CVV is required',
      'any.required': 'CVV is required',
    }),
  });
  return cardSchema.validate(data);
} catch (error) {
  throw error;
}
};





const validateUserPersonalProfile = (data) => {
  try {
    const validateSchema = joi.object({
      
      email: joi
        .string()
        .max(50)
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          "string.empty": "Email field can't be left empty",
          "any.required": "Please Email is required",
        }),
      password: joi
        .string()
        .min(8)
        .max(20)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .trim()
        .required()
        .messages({
          "string.empty": "Password field can't be left empty",
          "string.pattern.base":
            "Password must contain Lowercase, Uppercase, Numbers, and special characters",
          "string.min": "Password must be at least 8 characters long",
          "any.required": "Please password field is required",
        }),
      confirmPassword: joi
        .string()
        .min(8)
        .max(20)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        )
        .valid(joi.ref("password"))
        .trim()
        .required()
        .messages({
          "string.empty": "Password field can't be left empty",
          "string.pattern.base":
            "Password must contain Lowercase, Uppercase, Numbers, and special characters",
          "string.min": "Password must be at least 8 characters long",
          "any.required": "Please password field is required",
          "any.only": "Passwords do not match",
        }),
      company: joi
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9\s_\-!@#$%^&*()]*$/)
        .trim()
        .messages({
          "string.empty": "Company field can't be left empty",
          "string.min": "Minimum of 3 characters for the Company field",
          "string.max": "Maximum of 30 characters long for the Company field",
          "string.pattern.base": "Please enter a valid Company",
          "any.required": "Please Company is required",
        }),
      firstName: joi
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z]+$/)
        .trim()
        .messages({
          "string.empty": "First name field can't be left empty",
          "string.min": "Minimum of 3 characters for the first name field",
        }),
      lastName: joi
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z]+$/)
        .trim()
        .messages({
          "string.empty": "Last name field can't be left empty",
          "string.min": "Minimum of 3 characters for the last name field",
        }),
      tel: joi
        .string()
        .min(11)
        .max(11)
        .trim()
        .regex(/^0\d{10}$/)
        .messages({
          "string.empty": "Tel field can't be left empty",
          "string.min": "Tel must be atleast 11 digit long e.g: 08123456789",
          "string.pattern.base":
            "Tel must be atleast 10 digit long e.g: 8123456789",
          "any.required": "Please Tel is required",
        }),
    });
    return validateSchema.validate(data);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  validateUser,
  validateUserLogin,
  validateResetPassword,
  validateUserPersonalProfile,
  validateCardDetails
};
