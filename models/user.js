"use strict";
const bcrypt = require("bcrypt");
const db = require('../db');
const NotFoundError = require("../expressError")
const { BCRYPT_WORK_FACTOR } = require('../config');





/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    //generate hash password
    // TODO check on join_at column if we need to add it or not.
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`INSERT INTO users
                                  (username,       
                                    password,
                                    first_name,
                                    last_name,
                                    phone ) 
                                    VALUES 
                                    ($1, $2, $3, $4, $5)
                                    RETURNING username,
                                    password,
                                    first_name,
                                    last_name,
                                    phone`
      , [username, hashedPassword, first_name, last_name, phone])
    const user = result.row[0];
    return user;
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(`SELECT password FROM users 
                                      WHERE username=$1`, [username]);
    const user = result.row[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true
      }
    }
    return false
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const loginTime; //maybe DateTime?
    await db.query (`UPDATE users SET last_login_at=$1 WHERE username=$2`, [loginTime, username])
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(`SELECT
                                  username,
                                  first_name,
                                  last_name
                                  FROM users`)
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`SELECT
                                  username,
                                  first_name,
                                  last_name,
                                  phone,
                                  join_at,
                                  last_login_at
                                  FROM users
                                  WHERE 
                                  username=$1`, 
                                  [username])
    const user = result.rows[0];
    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
