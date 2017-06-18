/**
 * Place this on the model to trigger the schema creation.
 */
export function table() { return undefined; }

/**
 * Put this on one field only. Make sure that it is a number field.
 * TODO support primary keys that span multiple columns?
 */
export function primaryKey() { return undefined; }

/**
 * Allows the schema generation to create a foreign key on your behalf.
 * If you do not specify the column, it will default to whatever the
 * property name is.
 * eg) Do not specify -- photo.albumIDRef -> album.albumIDRef
 * eg) If you specify -- photo.albumIDRef -> album.albumID
 *     Notice how it doesn't try to do albumIDRef here ^.
 * @param table the table to reference for the key.
 * @param column the column in the table to reference.
 */
export function foreignKey(table: string, column?: string) { return undefined; }

/**
 * Use this decorator if you want the schema for the table to
 * say that this column cannot be null.
 */
export function required() { return undefined; }

/**
 * Should only be used on numbers.
 * Allows the creation of a constraint.
 * @param lowerLimit the lowest the number can go.
 * @param upperLimit the highest the number can go.
 */
export function range(lowerLimit: number, upperLimit: number) { return undefined; }