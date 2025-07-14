// ? Its an util wrapper for avoiding again and again need to write 'try/Catch' or '.then\.catch'
// * Its an H.O.F : Higher Order Function ,means it takes function as an parameter


// ? .then/.catch
const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise
            .resolve(requestHandler(req,res,next))
            .catch((error)=> next(error))
    }
}

export {asyncHandler};


// ? TRY\CATCH
// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
// export {asyncHandler};
