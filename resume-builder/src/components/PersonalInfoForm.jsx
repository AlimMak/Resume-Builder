import React, { useState } from "react";

function PersonalInfoForm(){
    const [inputs, setInputs] = useState({
        FirstName: '',
        LastName: '',
        Description: '' 
    });

    const [errors, setErrors] = useState ({
        FirstName: '',
        LastName: '',
        Description: '' 
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateInputs = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!inputs.FirstName.trim()){
            newErrors.FirstName = "First Name is required";
            isValid = false;
        } else {
            newErrors.FirstName = '';
        }

        if (!inputs.LastName.trim()){
            newErrors.LastName = "Last Name is required";
            isValid = false;
        } else {
            newErrors.LastName = '';
        }

        if (!inputs.Description.trim()){
            newErrors.Description = "Description is required";
            isValid = false;
        } else {
            newErrors.Description = '';
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({
        ...prev,
        [name]: value
        }));

        // will clear the error when typing starts
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Reset isSubmitted when user starts typing after an invalid submission
        if (isSubmitted) {
            setIsSubmitted(false);
        }
    };

    // Handle button click
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);

        if (validateInputs()) {
            console.log('Form submitted successfully:', inputs);
        } else {
            console.log('Form has errors');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input type="text" name="FirstName" value={inputs.FirstName} onChange={handleInputChange} placeholder="Enter First Name" className={errors.FirstName ? 'error' : ''}/>
                {errors.FirstName && <div className="error-message">{errors.FirstName}</div>}
            </div> 
            <div>
                <input type="text" name="LastName" value={inputs.LastName} onChange={handleInputChange} placeholder="Enter Last Name" className={errors.LastName ? 'error' : ''}/>
                {errors.LastName && <div className="error-message">{errors.LastName}</div>}
            </div> 
            <div>
                <input type="text" name="Description" value={inputs.Description} onChange={handleInputChange} placeholder="Enter Description" className={errors.Description ? 'error' : ''}/>
                {errors.Description && <div className="error-message">{errors.Description}</div>}
            </div>
            <button type="submit">Submit</button> 

            {isSubmitted && Object.values(errors).every(err => !err) &&(
                <div className="success-message">Form submitted successfully!</div>
            )}
        </form>
    ); 
}

export default PersonalInfoForm;