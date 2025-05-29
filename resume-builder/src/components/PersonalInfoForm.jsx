import React, { useState, useEffect } from "react";

function PersonalInfoForm({ initialData, onSubmit }){
    const [inputs, setInputs] = useState(() => {
        // Initialize with default structure, ensuring socials is always an array
        const defaultInputs = {
            FirstName: '',
            LastName: '',
            Description: '',
            socials: [{ platform: '', url: '' }],
            isUSCitizen: '',
            Email: '',
            Phone: ''
        };
        // Merge initialData with default structure, prioritizing initialData
        return initialData ? {
            ...defaultInputs,
            ...initialData,
            socials: initialData.socials || [{ platform: '', url: '' }],
            isUSCitizen: initialData.isUSCitizen || '',
            Email: initialData.Email || '',
            Phone: initialData.Phone || ''
        } : defaultInputs;
    });

    const [errors, setErrors] = useState({
        FirstName: '',
        LastName: '',
        Description: '',
        socials: [],
        isUSCitizen: '',
        Email: '',
        Phone: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    // useEffect to update state if initialData changes after initial render
    useEffect(() => {
        if (initialData) {
             setInputs(prev => ({
                ...prev,
                ...initialData,
                socials: initialData.socials || [{ platform: '', url: '' }],
                isUSCitizen: initialData.isUSCitizen || '',
                Email: initialData.Email || '',
                Phone: initialData.Phone || ''
             }));
        }
    }, [initialData]);


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

        if (!inputs.Email.trim()) {
            newErrors.Email = "Email is required";
            isValid = false;
        } else {
            newErrors.Email = '';
        }

        if (!inputs.Phone.trim()) {
            newErrors.Phone = "Phone number is required";
            isValid = false;
        } else {
            newErrors.Phone = '';
        }

        // Validate socials only if inputs.socials is an array
        const socialErrors = Array.isArray(inputs.socials) ? inputs.socials.map(social => {
            // Require platform if username is provided
            if (social.url && !social.platform) {
                return { platform: 'Platform is required when username is provided', url: '' };
            } else if (social.platform && !social.url) {
               // If a platform is selected, but no username is provided, it's not an error anymore
               return { platform: '', url: '' };
            }
            return { platform: '', url: '' };
        }) : []; // Return empty array if socials is not an array

        newErrors.socials = socialErrors;
        if (socialErrors.some(err => err.platform || err.url)) {
            isValid = false;
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

    const handleSocialChange = (index, field, value) => {
         // Ensure socials is an array before mapping
        if (!Array.isArray(inputs.socials)) {
            console.error("inputs.socials is not an array");
            return;
        }

        setInputs(prev => ({
            ...prev,
            socials: prev.socials.map((social, i) => 
                i === index ? { ...social, [field]: value } : social
            )
        }));

        // Clear social errors when typing
        if (errors.socials[index]?.[field]) {
            setErrors(prev => ({
                ...prev,
                socials: prev.socials.map((err, i) => 
                    i === index ? { ...err, [field]: '' } : err
                )
            }));
        }
    };

    const addSocial = () => {
         // Ensure socials is an array before adding
         if (!Array.isArray(inputs.socials)) {
            console.error("inputs.socials is not an array");
            return;
         }

        if (inputs.socials.length < 5) {
            setInputs(prev => ({
                ...prev,
                socials: [...prev.socials, { platform: '', url: '' }]
            }));
            setErrors(prev => ({
                ...prev,
                socials: [...prev.socials, { platform: '', url: '' }]
            }));
        }
    };

    const removeSocial = (index) => {
        // Ensure socials is an array before filtering
        if (!Array.isArray(inputs.socials)) {
            console.error("inputs.socials is not an array");
            return;
        }

        setInputs(prev => ({
            ...prev,
            socials: prev.socials.filter((_, i) => i !== index)
        }));
        setErrors(prev => ({
            ...prev,
            socials: prev.socials.filter((_, i) => i !== index) // Also filter errors array
        }));
    };

    // Handle button click
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);

        if (validateInputs()) {
            onSubmit(inputs);
        } else {
            console.log('Form has errors');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
            
            <div className="space-y-2">
                <input 
                    type="text" 
                    name="FirstName" 
                    value={inputs.FirstName} 
                    onChange={handleInputChange} 
                    placeholder="Enter First Name"
                    className="w-full p-2 border rounded"
                />
                {errors.FirstName && <div className="text-red-500 text-sm">{errors.FirstName}</div>}
            </div> 

            <div className="space-y-2">
                <input 
                    type="text" 
                    name="LastName" 
                    value={inputs.LastName} 
                    onChange={handleInputChange} 
                    placeholder="Enter Last Name"
                    className="w-full p-2 border rounded"
                />
                {errors.LastName && <div className="text-red-500 text-sm">{errors.LastName}</div>}
            </div> 

            <div className="space-y-2">
                <input 
                    type="text" 
                    name="Description" 
                    value={inputs.Description} 
                    onChange={handleInputChange} 
                    placeholder="Enter Description"
                    className="w-full p-2 border rounded"
                />
                {errors.Description && <div className="text-red-500 text-sm">{errors.Description}</div>}
            </div>

            <div className="space-y-2">
                <label htmlFor="isUSCitizen" className="block text-sm font-medium text-gray-700">US Citizen?</label>
                <select 
                    id="isUSCitizen"
                    name="isUSCitizen"
                    value={inputs.isUSCitizen}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
                {errors.isUSCitizen && <div className="text-red-500 text-sm">{errors.isUSCitizen}</div>}
            </div>

            <div className="space-y-2">
                <input 
                    type="email" 
                    name="Email" 
                    value={inputs.Email} 
                    onChange={handleInputChange} 
                    placeholder="Enter Email Address"
                    className="w-full p-2 border rounded"
                />
                {errors.Email && <div className="text-red-500 text-sm">{errors.Email}</div>}
            </div>

            <div className="space-y-2">
                <input 
                    type="tel" 
                    name="Phone" 
                    value={inputs.Phone} 
                    onChange={handleInputChange} 
                    placeholder="Enter Phone Number"
                    className="w-full p-2 border rounded"
                />
                {errors.Phone && <div className="text-red-500 text-sm">{errors.Phone}</div>}
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Social Media Links</h3>
                {/* Add a check here to ensure inputs.socials is an array */}
                {Array.isArray(inputs.socials) && inputs.socials.map((social, index) => (
                    <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                            {/* Dropdown for platform selection */}
                            <select
                                value={social.platform}
                                onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                                className="w-full p-2 border rounded mb-2"
                            >
                                <option value="">Select Platform</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="GitHub">GitHub</option>
                                <option value="Portfolio">Portfolio</option>
                                {/* Add more relevant platforms as needed */}
                            </select>
                            {/* Add a check for errors.socials[index] being defined */}
                            {errors.socials && errors.socials[index]?.platform && (
                                <div className="text-red-500 text-sm">{errors.socials[index].platform}</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={social.url}
                                onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                                placeholder="Username"
                                className="w-full p-2 border rounded mb-2"
                            />
                            {/* Add a check for errors.socials[index] being defined */}
                            {errors.socials && errors.socials[index]?.url && (
                                <div className="text-red-500 text-sm">{errors.socials[index].url}</div>
                            )}
                        </div>
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => removeSocial(index)}
                                className="p-2 text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                
                {/* Add a check here to ensure inputs.socials is an array */}
                {Array.isArray(inputs.socials) && inputs.socials.length < 5 && (
                    <button
                        type="button"
                        onClick={addSocial}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        + Add Social Media Link
                    </button>
                )}
            </div>

            <button 
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
                Next: Work Experience
            </button>

            {isSubmitted && Object.values(errors).every(err => !err) && (
                <div className="text-green-500">Form submitted successfully!</div>
            )}
        </form>
    ); 
}

export default PersonalInfoForm;