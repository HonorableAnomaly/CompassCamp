const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/compass-camp"),
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  };

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected...");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6269f4895139793a04926989",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251/640x426",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet nobis provident possimus reiciendis labore? Dolor veritatis mollitia voluptatibus numquam impedit, recusandae minima saepe maxime delectus iusto itaque doloremque similique suscipit? Repellat officia, molestiae deserunt ducimus pariatur iste quia porro saepe perferendis. Corrupti dicta veniam sed molestias dignissimos provident exercitationem autem maxime quibusdam recusandae voluptatum ad, nulla minima molestiae labore consequuntur? Earum, quos, hic dolor eos eum laudantium quasi est perferendis quidem asperiores odit. At quidem, eius, nihil cumque odit magnam ullam, iste consequuntur tempore debitis soluta sint tempora numquam necessitatibus?",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
