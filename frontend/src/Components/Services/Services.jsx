import React, { Component } from "react";

// imports react-icons
import { FaCocktail, FaHiking, FaShuttleVan, FaBeer } from "react-icons/fa";

// imports components
import Title from "../Title/Title";

export default class Services extends Component {
  state = {
    services: [
      {
        icon: <FaCocktail />,
        title: "free cocktails",
        info:
          "Enjoy a variety of delicious, expertly crafted cocktails on the house. Whether you prefer a classic martini, a refreshing mojito, or something more adventurous, we've got the perfect drink waiting for you!",
      },
      {
        icon: <FaHiking />,
        title: "endless hiking",
        info:
          "Explore miles of stunning trails with breathtaking views. From serene forest walks to challenging mountain hikes, our endless hiking opportunities cater to all skill levels. Embrace nature and discover hidden gems along the way",
      },
      {
        icon: <FaShuttleVan />,
        title: "free shuttle",
        info:
          "Forget the hassle of transportation. Our complimentary shuttle service ensures you can easily explore the area, whether you're heading to the city center, nearby attractions, or just relaxing at your destination",
      },
      {
        icon: <FaBeer />,
        title: "storages beer",
        info:
          "Quench your thirst with an ice-cold beer anytime. We offer a variety of locally brewed and international beers, stored at the perfect temperature to keep them crisp and refreshing throughout your stay",
      },
    ],
  };

  render() {
    return (
      <section className="services">
        <Title title="services" />

        <div className="services-center">
          {this.state.services.map((item, index) => {
            return (
              <article key={index} className="services">
                <span>{item.icon}</span>
                <h6>{item.title}</h6>
                <p>{item.info}</p>
              </article>
            );
          })}
        </div>
      </section>
    );
  }
}
