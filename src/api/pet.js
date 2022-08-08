import express from "express";
import { verifyToken } from "../auth/token";
import { User } from '../../models';
import { Pet } from '../../models';
import multer from "multer";
import path from "path";

const router = express.Router();

// 반려견 사진 추가
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) { // 저장 위치
            done(null, 'img/'); // uploads라는 폴더 안에 저장
        },
        filename(req, file, done) { // 파일명을 어떤 이름으로 올릴지
            const ext = path.extname(file.originalname); // 파일의 확장자
            done(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일이름 + 날짜 + 확장자 이름으로 저장
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// 반려견 정보 등록
router.post("/", verifyToken, upload.single("petimg"), async (req, res) => {
    
    const petName = req.body.petName;
    const weight = req.body.weight;
    const age = req.body.age;
    const dogBreed = req.body.dogBreed;
    const note = req.body.note;
    const userId = req.decoded.id;

    const petImg = req.file == undefined ? "": req.file.path;

    const userIdCheck = await User.findAll({
        where:{
            id : userId
        }
    });

    if(userIdCheck.length != 0) {
        const newPet = await Pet.create({
            petName : petName,
            age : age,
            weight : weight,
            dogBreed : dogBreed,
            note : note,
            petImg: petImg,
            userId : userId
        });
        return res.json({
            data : "강아지 정보가 등록되었습니다."
        });
    };

    return res.json({
        error : "등록오류"
    });
});

//반려견 정보 수정 (보류 - 마이페이지)
router.put("/:petId", verifyToken, async (req, res) => {
    try {
        const { petId } = req.params;
        const petName = req.body.petName;
        const weight = req.body.weight;
        const age = req.body.age;
        const dogBreed = req.body.dogBreed;
        const note = req.body.note;
        const userId = req.decoded.id;


        const petIdCheck = await Pet.findAll({
            where:{
                userId : userId
            }
        });

        if(petIdCheck.length != 0) {
            const newPet = await Pet.update({
                petName : petName,
                age : age,
                weight : weight,
                dogBreed : dogBreed,
                note : note
            }, {
                where : {
                    id : petIdCheck[parseInt(petId)-1].id
                }
            });
            return res.json({
                data : "강아지 정보가 수정되었습니다."
            });
        };
    }
    catch(error) {
        return res.status(409).json({
            error : "수정오류"
        });
    }
    
});

// 반려견 정보 삭제 (보류 - 마이페이지)
router.delete("/:petId", verifyToken, async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.decoded.id;

        const petIdCheck = await Pet.findAll({
            where:{
                userId : userId
            }
        });

        if(petIdCheck.length != 0) {
            const newPet = await Pet.destroy({
                where : {
                    id : petIdCheck[parseInt(petId)-1].id
                }
            });
            return res.json({
                data : "강아지 정보가 삭제되었습니다."
            });
        };
    }
    catch(error) {
        return res.status(409).json({
            error : "삭제오류"
        });
    }
});


// 반려견 메인화면 예약내역 노출
router.get("/main", verifyToken, async (req, res) => {
    
    const userId = req.decoded.id;

    const userIdCheck = await User.findAll({
        where:{
            id : userId
        }
    });

    if(userIdCheck.length != 0) {
        const petData = await Pet.findAll({
            attributes: ["petName", "petImg"],
            where:{
                userId : userId
            }
        });

        return res.json({
            data : petData
        });
    };

    return res.status(400).json({
        error : "GET 요청 오류"
    });
});
export default router;