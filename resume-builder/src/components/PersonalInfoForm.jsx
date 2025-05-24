import React, { useState } from "react";

function PersonalInfoForm(){
    const [inputs, setInputs] = useState({
        FirstName: '',
        LastName: '',
        Birthday: '',
        Description: '' 
    });


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({
        ...prev,
        [name]: value
        }));
    };

    // Handle button click
    const handleSubmit = () => {
        console.log('Submitted values:', inputs);
        // Add your button click logic here
    };

    return (
        <div>
            <input type="text" name="FirstName" value={inputs.FirstName} onChange={handleInputChange} placeholder="Enter First Name"/>
            <input type="text" name="LastName" value={inputs.LastName} onChange={handleInputChange} placeholder="Enter Last Name"/>
            <input type="date" name="Birthday" value={inputs.Birthday} onChange={handleInputChange} placeholder="Enter Birthday"/>
            <input type="text" name="Description" value={inputs.Description} onChange={handleInputChange} placeholder="Enter a brief description about you"/>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default PersonalInfoForm;