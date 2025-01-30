import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import defaultBcg from "../assets/img/jpeg/room-1.jpeg";
import Banner from "../Components/Banner/Banner";
import { RoomContext } from "../Context/Context";
import StyledHero from "../Components/StyledHero/StyledHero";

export default function SingleRoom(props) {
  const history = useHistory();  
  const { getRoom } = React.useContext(RoomContext);  
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const { slug } = props.match.params; 

  useEffect(() => {
    const roomData = getRoom(slug);
    if (roomData) {
      setRoom(roomData);
    } else {
      setError("Room not found");
    }
  }, [slug, getRoom]);

  if (!room) {
    return (
      <div className="error">
        <h3>{error}</h3>
        <Link to="/rooms" className="btn-primary">Back to rooms</Link>
      </div>
    );
  }

  const {
    name,
    description,
    capacity,
    size,
    price,
    extras,
    breakfast,
    pets,
    images,
  } = room;

  const [mainImg, ...defaultImg] = images;

  // Check if user is logged in (by checking the token in localStorage)
  const isLoggedIn = localStorage.getItem("token");

  const handleBookingClick = () => {
    if (isLoggedIn) {
      // User is logged in, proceed with booking
      history.push({
        pathname: "/booking",
        state: {
          roomName: name,
          price: price,
          guests: capacity,
        },
      });
    } else {
      // Redirect to login if the user is not logged in
      history.push("/login");
    }
  };

  return (
    <>
      <StyledHero img={mainImg || defaultBcg}>
        <Banner title={`${name} room`}>
          <Link to="/rooms" className="btn-primary">
            Back to rooms
          </Link>
        </Banner>
      </StyledHero>

      <section className="single-room">
        <div className="single-room-images">
          {defaultImg.map((item, index) => {
            return <img key={index} src={`/${item}`} alt={name} />;
          })}
        </div>
        <div className="single-room-info">
          <article className="desc">
            <h3>details:</h3>
            <p>{description}</p>
          </article>

          <article className="info">
            <h3>information:</h3>
            <h6>price : ${price}</h6>
            <h6>size : {size} SQFT</h6>
            <h6>
              max capacity : {capacity > 1 ? `${capacity} people` : `${capacity} person`}
            </h6>
            <h6>{pets ? "pets allowed" : "no pets allowed"}</h6>
            <h6>{breakfast && "free breakfast included"}</h6>
          </article>
        </div>
      </section>

      <section className="room-extras">
        <h6>extras:</h6>
        <ul className="extras">
          {extras.map((item, index) => {
            return <li key={index}> - {item}</li>;
          })}
        </ul>
      </section>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          className="btn-primary"
          onClick={handleBookingClick}
        >
          Book a Room
        </button>
      </div>
      <br></br>
    </>
  );
}
