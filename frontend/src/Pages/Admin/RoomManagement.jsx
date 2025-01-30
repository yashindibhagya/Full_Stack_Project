import React, { useState, useEffect } from "react";

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [newRoom, setNewRoom] = useState({
    room_id: "",
    room_name: "",
    capacity: "",
    price: "",
    size: "",
    room_type: "Single", 
    pets: false,
    breakfast: false,
    description: "",
    extras: "",
    images: "",
  });

  // Fetch all rooms on component mount
  useEffect(() => {
    fetch("http://localhost:5000/api/rooms")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch rooms.");
        }
        return res.json();
      })
      .then((data) => setRooms(data))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  const handleAddOrUpdateRoom = () => {
    const formData = new FormData();
    formData.append("room_id", newRoom.room_id);
    formData.append("room_name", newRoom.room_name);
    formData.append("capacity", parseInt(newRoom.capacity, 10) || 0);
    formData.append("price", parseFloat(newRoom.price) || 0);
    formData.append("size", parseInt(newRoom.size, 10) || 0);
    formData.append("room_type", newRoom.room_type);
    formData.append("description", newRoom.description);
    formData.append("pets", newRoom.pets);
    formData.append("breakfast", newRoom.breakfast);
    formData.append("extras", newRoom.extras);
    formData.append("status", 1);
  
    Array.from(newRoom.images).forEach((image) => {
      formData.append("images", image);
    });
  
    const url = isEditMode
      ? `http://localhost:5000/api/rooms/${editingRoomId}`
      : `http://localhost:5000/api/rooms`;
  
    fetch(url, {
      method: isEditMode ? "PUT" : "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((room) => {
        if (isEditMode) {
          // Update the room in the list
          setRooms((prevRooms) =>
            prevRooms.map((r) => (r._id === room._id ? room : r))
          );
        } else {
          // Add the new room to the list
          setRooms((prevRooms) => [...prevRooms, room]);
        }
  
        // Update the local data.js file on the backend
        updateLocalDataJs(room);
  
        resetForm();
      })
      .catch((error) => console.error("Error adding/updating room:", error));
  };
  
  // Function to update the local data.js file (send data to backend)
  const updateLocalDataJs = (room) => {
    const newRoomData = {
      sys: { id: room.room_id },
      fields: {
        name: room.room_name,
        slug: `${room.room_type}-standard`,
        type: room.room_type,
        price: room.price,
        size: room.size,
        capacity: room.capacity,
        pets: room.pets,
        breakfast: room.breakfast,
        featured: true,
        description: room.description,
        extras: room.extras,
        status: room.status,
        images: [
          ...room.images.map((img) => ({
            fields: { file: { url: img } },
          })),
          {
            fields: { file: { url: 'details-2.jpeg' } },
          },
          {
            fields: { file: { url: 'details-3.jpeg' } },
          },
          {
            fields: { file: { url: 'details-4.jpeg' } },
          },
        ],
      },
    };
    
  
    // Send the new room data to the backend to update data.js
    fetch('http://localhost:5000/api/update-local-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( newRoomData ),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Data updated successfully:', data);
      })
      .catch((error) => {
        console.error('Error updating data:', error);
      });
  };  
  

  // Load room data into form for editing
  const handleEditRoom = (room) => {
    setNewRoom({
      room_id: room.room_id,
      room_name: room.room_name,
      capacity: room.capacity,
      price: room.price,
      size: room.size,
      room_type: room.room_type,
      pets: room.pets,
      breakfast: room.breakfast,
      description: room.description,
      extras: room.extras.join(", "),
      images: "",
    });
    setEditingRoomId(room._id);
    setIsEditMode(true);
  };

  // Reset form after adding/updating
  const resetForm = () => {
    setNewRoom({
      room_id: "",
      room_name: "",
      capacity: "",
      price: "",
      size: "",
      room_type: "Single",
      pets: false,
      breakfast: false,
      description: "",
      extras: "",
      images: "",
    });
    setIsEditMode(false);
    setEditingRoomId(null);
  };

  // Handle file change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewRoom({ ...newRoom, images: files });
  };

  // Handle Delete Room
  const handleDeleteRoom = (id) => {
    fetch(`http://localhost:5000/api/update-room-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: 3 }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete room.");
        }
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.room_id === id ? { ...room, status: 3 } : room
          )
        );
      })
      .catch((error) => console.error("Error deleting room:", error));
  };

  return (
    <div className="room-management">
      <h3>Room Management</h3>
      <div className="content-wrapper">
        {/* Left Form Section */}
        <div className="room-form">
          <label>Room ID</label>
          <input
            type="text"
            value={newRoom.room_id}
            onChange={(e) => setNewRoom({ ...newRoom, room_id: e.target.value })}
          />

          <label>Room Name</label>
          <input
            type="text"
            value={newRoom.room_name}
            onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })}
          />

          <label>Capacity</label>
          <input
            type="number"
            value={newRoom.capacity}
            onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
          />

          <label>Size</label>
          <input
            type="number"
            value={newRoom.size}
            onChange={(e) => setNewRoom({ ...newRoom, size: e.target.value })}
          />

          <label>Room Description</label>
          <input
            type="text"
            value={newRoom.description}
            onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
          />

          <label>Price</label>
          <input
            type="number"
            value={newRoom.price}
            onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
          />

          <div className="room-type-container">
            <label htmlFor="room-type">Room Type</label>
            <select
              id="room_type"
              value={newRoom.room_type}
              onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Family">Family</option>
              <option value="Presidential">Presidential</option>
            </select>
          </div>

          <label>Extras (comma-separated)</label>
          <textarea
            value={newRoom.extras}
            onChange={(e) => setNewRoom({ ...newRoom, extras: e.target.value })}
          />

          <div className="checkbox-container">
            <label>
              Allow Pets
              <input
                type="checkbox"
                checked={newRoom.pets}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, pets: e.target.checked })
                }
              />
            </label>

            <label>
              Include Breakfast
              <input
                type="checkbox"
                checked={newRoom.breakfast}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, breakfast: e.target.checked })
                }
              />
            </label>
          </div>

          <label>Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />

          <button onClick={handleAddOrUpdateRoom}>
            {isEditMode ? "Update Room" : "Add Room"}
          </button>
          {isEditMode && <button onClick={resetForm}>Cancel Edit</button>}
        </div>

        {/* Right Table Section */}
        <div className="room-table-container">
          <table className="room-table">
            <thead>
              <tr>
                <th>Room ID</th>
                <th>Room Name</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>Size</th>
                <th>Room Type</th>
                <th>Description</th>
                <th>Pets</th>
                <th>Breakfast</th>
                <th>Extras</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms
                .filter((room) => room.status !== 3)
                .map((room) => (
                  <tr key={room._id}>
                    <td>{room.room_id}</td>
                    <td>{room.room_name}</td>
                    <td>{room.capacity}</td>
                    <td>${room.price}</td>
                    <td>{room.size} sq ft</td>
                    <td>{room.room_type}</td>
                    <td>{room.description}</td>
                    <td>{room.pets ? "Yes" : "No"}</td>
                    <td>{room.breakfast ? "Yes" : "No"}</td>
                    <td>{room.extras.join(", ")}</td>
                    <td>
                      {room.images &&
                        room.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Room ${room.room_id} - ${index + 1}`}
                            style={{ width: "50px", height: "50px" }}
                          />
                        ))}
                    </td>
                    <td>
                      <button onClick={() => handleEditRoom(room)}>Edit</button>
                      <button onClick={() => handleDeleteRoom(room.room_id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoomManagement;
