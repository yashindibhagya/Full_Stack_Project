import React, { Component } from "react";
import fetchData from "../Data/data"; // Import the fetchData function

// react context-api
const RoomContext = React.createContext();

class RoomProvider extends Component {
  state = {
    rooms: [],
    sortedRooms: [],
    featuredRooms: [],
    loading: true,
    type: "all",
    capacity: 1,
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    minSize: 0,
    maxSize: 0,
    breakfast: false,
    pets: false,
  };

  // Fetch data when the component mounts
  componentDidMount() {
    this.getData();
  }

  // Fetch and format data
  getData = async () => {
    try {
      // Fetch data from the backend
      let items = await fetchData();

      // Format the data
      let rooms = this.formatData(items);

      // Find featured rooms
      let featuredRooms = rooms.filter((room) => room.featured === true);

      // Determine max price and size
      let maxPrice = Math.max(...rooms.map((item) => item.price));
      let maxSize = Math.max(...rooms.map((item) => item.size));

      // Set the state with the fetched and formatted data
      this.setState({
        rooms,
        featuredRooms,
        sortedRooms: rooms,
        loading: false,
        price: maxPrice,
        maxPrice,
        maxSize,
      });
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };

  // Format data to match the state structure
  formatData(items) {
    let tempItems = items.map((item) => {
      let id = item.id; // Assuming id is already formatted in fetchData
      let images = item.images; // Images are already formatted as URLs

      // Return the formatted room object
      let room = { ...item, images, id };
      return room;
    });
    return tempItems;
  }

  // Find a specific room by slug
  getRoom = (slug) => {
    let tempRooms = [...this.state.rooms];
    const room = tempRooms.find((room) => room.slug === slug);
    return room;
  };

  // Handle filter changes
  handleChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = event.target.name;

    this.setState(
      {
        [name]: value,
      },
      this.filterRooms
    );
  };

  // Filter rooms based on current state
  filterRooms = () => {
    let {
      rooms,
      type,
      capacity,
      price,
      minSize,
      maxSize,
      breakfast,
      pets,
    } = this.state;

    // All rooms
    let tempRooms = [...rooms];

    // Transform values
    capacity = parseInt(capacity);
    price = parseInt(price);

    // Filter by type
    if (type !== "all") {
      tempRooms = tempRooms.filter((room) => room.type === type);
    }

    // Filter by capacity
    if (capacity !== 1) {
      tempRooms = tempRooms.filter((room) => room.capacity >= capacity);
    }

    // Filter by price
    tempRooms = tempRooms.filter((room) => room.price <= price);

    // Filter by size
    tempRooms = tempRooms.filter(
      (room) => room.size >= minSize && room.size <= maxSize
    );

    // Filter by breakfast
    if (breakfast) {
      tempRooms = tempRooms.filter((room) => room.breakfast === true);
    }

    // Filter by pets
    if (pets) {
      tempRooms = tempRooms.filter((room) => room.pets === true);
    }

    // Update state with filtered rooms
    this.setState({
      sortedRooms: tempRooms,
    });
  };

  render() {
    return (
      <RoomContext.Provider
        value={{
          ...this.state,
          getRoom: this.getRoom,
          handleChange: this.handleChange,
        }}
      >
        {this.props.children}
      </RoomContext.Provider>
    );
  }
}

const RoomConsumer = RoomContext.Consumer;

// Higher-order component to consume Room context
export function withRoomConsumer(Component) {
  return function ConsumerWrapper(props) {
    return (
      <RoomConsumer>
        {(value) => <Component {...props} context={value} />}
      </RoomConsumer>
    );
  };
}

export { RoomProvider, RoomConsumer, RoomContext };
