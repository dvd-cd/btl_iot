import bcrypt from "bcryptjs";

const hash = async (object) => {
    return await bcrypt.hash(object, 10);
}
const compare = async (object, hashedObject) => {
    return await bcrypt.compare(object, hashedObject);
}

export {
    hash,
    compare
}
