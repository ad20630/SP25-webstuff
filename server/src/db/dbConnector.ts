/**
 * This module will be used to manage connecting and querying the database
 * 
 * Created By: Chris Morgan
 * 
 * see https://github.com/mysqljs/mysql for details on mysql js library
 */

import mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

export interface DBUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// Add type definitions for mysql
interface MysqlPool {
  createPool(config: mysql.PoolConfig): mysql.Pool;
}

interface MysqlConnection {
  release(): void;
}

interface MysqlError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
}

interface MysqlQueryResult {
  insertId?: number;
  affectedRows?: number;
  changedRows?: number;
}

class DBConnector {
  private static instance: DBConnector;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'webstuff_user',
      password: process.env.DB_PASSWORD || 'Webstuff@123456',
      database: process.env.DB_NAME || 'webstuff_db'
    });

    // Test the connection
    this.pool.getConnection((err: mysql.MysqlError | null, connection: mysql.PoolConnection) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Database connected successfully');
        connection.release();
      }
    });
  }

  public static getInstance(): DBConnector {
    if (!DBConnector.instance) {
      DBConnector.instance = new DBConnector();
    }
    return DBConnector.instance;
  }

  private query(sql: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, params, (error: mysql.MysqlError | null, results: any[]) => {
        if (error) {
          console.error('Database query error:', error);
          reject(error);
          return;
        }
        resolve(results);
      });
    });
  }

  async createUser(user: Omit<DBUser, 'id' | 'created_at' | 'updated_at'>): Promise<DBUser> {
    const result = await this.query(
      'INSERT INTO User (email, password_hash, name) VALUES (?, ?, ?)',
      [user.email, user.password_hash, user.name]
    );
    
    const newUser = await this.query(
      'SELECT * FROM User WHERE id = ?',
      [result.insertId]
    );
    
    return newUser[0];
  }

  async findUserByEmail(email: string): Promise<DBUser | null> {
    const users = await this.query(
      'SELECT * FROM User WHERE email = ?',
      [email]
    );
    return users.length > 0 ? users[0] : null;
  }

  async findUserById(id: number): Promise<DBUser | null> {
    const users = await this.query(
      'SELECT * FROM User WHERE id = ?',
      [id]
    );
    return users.length > 0 ? users[0] : null;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pool.end((err: mysql.MysqlError | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default DBConnector.getInstance();
