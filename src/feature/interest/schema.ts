import {z} from "zod";
const interestSchema=z.object({
    topicId:z.string()
})

export {interestSchema};