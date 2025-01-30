// data.js
const fetchData = async () => {
  try {
    // Fetch the room data from the backend
    const response = await fetch('http://localhost:5000/api/details');
    const data = await response.json();

    const filteredData = data.filter(item => item.fields.status !== 3);

    // Format the data to match the structure used in RoomProvider
    const formattedData = formatData(filteredData);

    // Return the formatted data
    return formattedData;
  } catch (error) {
    console.error('Error fetching room details:', error);
    return [];
  }
};

const formatData = (data) => {
  return data.map(item => {
    // Extract the necessary fields from sys and fields
    const id = item.sys.id;
    const { name, slug, type, price, size, capacity, pets, breakfast, featured, description, extras, images } = item.fields;
    
    // Format images (assuming images are in the format provided in the example)
    const formattedImages = images.map(image => image.fields.file.url);

    // Return the formatted room object
    return {
      id,
      name,
      slug,
      type,
      price,
      size,
      capacity,
      pets,
      breakfast,
      featured,
      description,
      extras,
      images: formattedImages,
    };
  });
};

// Export the data fetching function
export default fetchData;
