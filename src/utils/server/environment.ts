export module Environment {

    /**
     * A helper method to abstract away the necessary code to determine
     * if the current Node environment is running in development mode.
     * @returns if the current environment is running in development mode.
     */
    export function isDevelopment(): boolean {
        // We have to trim this because package.json include the trailing space.
        let node_env = !process.env.NODE_ENV ||
            process.env.NODE_ENV.trim() === 'development';
        return node_env;
    }

    /**
     * Pieces of information needed by the database to connect.
     */
    interface DatabaseConnectionInformation {
        host: string;
        database: string;
        user: string;
        password: string;
    }

    /**
     * A helper method to retrieve the database connection details 
     * from the environment variables.
     * @return an object with the fields to connect to the database.
     */
    export function getDatabaseConnectionInformation(): DatabaseConnectionInformation {
        let info: DatabaseConnectionInformation = {
            host: process.env.DB_HOST,
            database: process.env.DB_SOURCE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        };
        return info;
    }
}