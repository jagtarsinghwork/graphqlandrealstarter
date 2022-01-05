/* SPDX-FileCopyrightText: 2016-present Kriasoft <hello@kriasoft.com> */
/* SPDX-License-Identifier: MIT */

const fs = require("fs");
const nanoid = require("nanoid");
const prettier = require("prettier");
const { name, date, image, internet, random } = require("faker");

// Short ID generator
// https://zelark.github.io/nano-id-cc/
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const newUserId = nanoid.customAlphabet(alphabet, 6);

function stringify(obj) {
  return prettier.format(JSON.stringify(obj), { parser: "json" });
}

/**
 * Seeds the database with test / reference user accounts.
 *
 * @param {import("knex").Knex} db
 */
module.exports.seed = async (db) => {
  const jsonFile = __filename.replace(/\.\w+$/, ".json");
  let users = require(jsonFile);

  // Generates fake user accounts
  // https://github.com/marak/Faker.js
  if (users.length === 0) {
    console.log("Generating users.json...");
    const usernames = new Set();

    users = Array.from({ length: 200 }).map(() => {
      const id = newUserId();
      const gender = random.arrayElement(["male", "female"]);
      const firstName = name.firstName(gender);
      const lastName = name.lastName(gender);
      let username = `${firstName.toLowerCase()}${random.number(50)}`;
      const createdAt = date.recent(365);

      // Ensures that the username is unique
      while (usernames.has(username)) {
        username = `${firstName.toLowerCase()}${random.number(50)}`;
      }

      usernames.add(username);

      return {
        id,
        username,
        email: internet.email(firstName, lastName).toLowerCase(),
        name: `${firstName} ${lastName}`,
        given_name: firstName,
        family_name: lastName,
        picture: { url: image.avatar() },
        created: createdAt,
        updated: createdAt,
        last_login:
          Math.random() > 0.5 ? date.between(createdAt, new Date()) : null,
      };
    });

    fs.writeFileSync(jsonFile, stringify(users), "utf8");
  }

  await db.table("user").insert(users);
};
