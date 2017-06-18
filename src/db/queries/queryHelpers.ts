export module QueryHelpers {
    /**
     * This method uses the keyof functionality to check that the keys
     * the user passes in adhere to the object type they pass.
     * Unfortunately, it does not by default use the prototype so in order
     * to get the columns, T must be the object's prototype or an instance
     * of the object. Since we wouldn't want to instantiate a object every
     * time we just want to specify some columns, this should be used with
     * the prototype.
     * 
     * eg) Queries.getColumns(Class.prototype, 'column1', 'column2');
     * 
     * @param obj the prototype of the class you want to retrieve columns from.
     * @param keys the columns you want to include.
     */
    export function getColumns<T, K extends keyof T>(obj: T, ...keys: K[]) {
        return keys.map(value => `"${value}"`);
    }

    /**
     * Takes an array of objects, and a list of properties.
     * Using the list of properties, extract each property from each object and put
     * them into a flat array that can be passed to the Multiple insert.
     * 
     * eg) flatten [{ a,b,c }, { a,b,c }] => [{ a,b }, { a,b }]
     *     In order to fit in the query, ($1, $2), ($3, $4)  
     * 
     * @param objArray The list of objects of type T.
     * @param keys the keys from the object that we should push to the final array.
     */
    export function flattenObjectArray<T, K extends keyof T>(objArray: T[], ...keys: K[]) {
        let returnArray = [];
        for (let i = 0; i < objArray.length; i++) {
            let obj = objArray[i];
            for (let j = 0; j < keys.length; j++) {
                let key = keys[j];
                returnArray.push(obj[key]);
            }
        }
        return returnArray;
    }
}