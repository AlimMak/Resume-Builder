import React, { useState, useEffect } from "react";

function PersonalInfoForm({ initialData, onSubmit }){
    const [inputs, setInputs] = useState(() => {
        // Initialize with default structure, ensuring socials is always an array
        const defaultInputs = {
            FirstName: '',
            LastName: '',
            Description: '',
            socials: [{ platform: '', url: '' }]
        };
        // Merge initialData with default structure, prioritizing initialData
        return initialData ? {
            ...defaultInputs,
            ...initialData,
            socials: initialData.socials || [{ platform: '', url: '' }]
        } : defaultInputs;
    });

    const [errors, setErrors] = useState({
        FirstName: '',
        LastName: '',
        Description: '',
        socials: []
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    // useEffect to update state if initialData changes after initial render
    useEffect(() => {
        if (initialData) {
             setInputs(prev => ({
                ...prev,
                ...initialData,
                socials: initialData.socials || [{ platform: '', url: '' }]
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

        // Validate socials only if inputs.socials is an array
        const socialErrors = Array.isArray(inputs.socials) ? inputs.socials.map(social => {
            if (social.platform && !social.url) {
                return { platform: '', url: 'URL is required when platform is provided' };
            }
            if (!social.platform && social.url) {
                return { platform: 'Platform is required when URL is provided', url: '' };
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

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Social Media Links</h3>
                {/* Add a check here to ensure inputs.socials is an array */}
                {Array.isArray(inputs.socials) && inputs.socials.map((social, index) => (
                    <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={social.platform}
                                onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                                placeholder="Platform (e.g., LinkedIn, GitHub)"
                                className="w-full p-2 border rounded mb-2"
                            />
                            {/* Add a check for errors.socials[index] being defined */}
                            {errors.socials && errors.socials[index]?.platform && (
                                <div className="text-red-500 text-sm">{errors.socials[index].platform}</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="url"
                                value={social.url}
                                onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                                placeholder="URL"
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