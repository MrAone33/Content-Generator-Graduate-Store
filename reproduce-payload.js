
// Simulation of the client-side logic in useGenerator.js

// 1. Initial State
let formData = {
    keyword: 'test',
    links: [{ anchor: '', url: '' }], // Initial state
};

// 2. Simulating User Input (via setFormData / handleLinkChange)
// The user types "Mon ancre" and "https://example.com"
// In LinksList.jsx, handleLinkChange does:
const newLinks = [...formData.links];
newLinks[0] = { ...newLinks[0], anchor: 'Mon ancre', url: 'https://example.com' };
formData = { ...formData, links: newLinks };

console.log("State after input:", JSON.stringify(formData, null, 2));

// 3. Simulating handleGenerate payload construction
const payload = {
    ...formData,
    generationType: 'text',
    // Logic from useGenerator.js line 106-107
    anchor: formData.links[0]?.anchor || "",
    url: formData.links[0]?.url || ""
};

console.log("Payload constructed:", JSON.stringify(payload, null, 2));

// Check if data is present
if (payload.anchor === 'Mon ancre' && payload.url === 'https://example.com') {
    console.log("SUCCESS: Payload logic is correct.");
} else {
    console.log("FAILURE: Payload logic is broken.");
}
