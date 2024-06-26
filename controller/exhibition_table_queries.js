// functions associated with getting data from the exhibition table
const { query } = require("express");
const db = require("../db/db")

const getAllExhibitions = async(req, res) => {
    try {
        const exhibitions = await db.select("*").from("exhibitions");
        res.send(exhibitions);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message}) 
    }
}

// get the exhibitions that can be displayed on the home page
const getExhibitionsHomePage = async(req, res) => {
    try {
        const exhibitions = await db.select("*").from("exhibitions")
            .where("display_on_home_page", true);
        res.send(exhibitions);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message})
    }
}

// get a json string of the exhibitions that can be displayed on the home page
const getExhibitionsHomePageJSON = async() => {
    try {
        console.log("starting")
        columns = ['exhibitions.exhibition_id', 'exhibitions.description', 'exhibitions.video_html_code', 'users.first_name', 'users.last_name', 'classes.academic_year', 'classes.term', 'courses.course_number', 'courses.course_name']
        const exhibitions = await db
            .select(columns.concat([
                db.raw('ARRAY_AGG(skills.skill_name) skills'),
                db.raw('ARRAY_AGG(skills.throughline) throughlines')
               ]))
            .from("exhibitions")
            
            .where("display_on_home_page", true)
            .innerJoin("users", "exhibitions.user_id_ref", "=", "users.user_id")
            .innerJoin("classes", "exhibitions.class_id_ref", "=", "classes.class_id")
            .innerJoin("courses", "classes.course_id_ref", "=", "courses.course_id")
            .leftJoin("exhibitionSkillPairs", "exhibitions.exhibition_id", "exhibitionSkillPairs.exhibition_id_ref")
            
            .leftJoin("skills", "exhibitionSkillPairs.skill_id_ref", "skills.skill_id")
            
            .groupBy(columns)
            ;
            console.log("returning");
            console.log(JSON.stringify(exhibitions));
        return exhibitions;
    } catch (error) {
        console.log(error)
        return [];
    }
}

// IN PROGRESS: get exhibitions from a search results api call ------------------
const searchExhibitions = async(req, res) => {
    try {
        const student_id = parseInt(req.params.student_id);

        const course_id = parseInt(req.params.course_id);

        const teacher_id = parseInt(req.params.teacher_id);

        const skill_ids = req.params.skill_ids;
        const skill_ids_array = skill_ids.split("_").map(Number);
        console.log(skill_ids_array);
        // REFACTORING CHECK: ERROR CHECKING, WHAT IF SOMEONE DOESN'T PUT ANYTHING/PUTS A LETTER INSTEAD OF A NUMBER

        const academic_year = parseInt(req.params.academic_year);

        const term = parseInt(req.params.term);
        
        const selectedExhibitions = 
        await db.select("*").from("exhibitions")
            //.where("student_id", req.params.student_id);
            .modify(function(queryBuilder) {
                if(student_id != 0){
                    queryBuilder.where("exhibitions.user_id_ref", student_id)
                    // WHERE IN
                }

                if(course_id != 0) {
                    queryBuilder.where("exhibitions.course_id_ref", course_id)
                }

                queryBuilder.innerJoin("courses", "exhibitions.course_id_ref", "=", "courses.course_id")
                
                if(teacher_id !== 0) {
                    queryBuilder.where("courses.user_id_ref", teacher_id)
                }

                if(academic_year !== 0) {
                    queryBuilder.where("courses.academic_year", academic_year)
                }

                if(term != 0) {
                    queryBuilder.where("courses.term", term)
                }

                queryBuilder.innerJoin("exhibitionSkillPairs", "exhibitions.exhibition_id", "=", "exhibitionSkillPairs.exhibition_id_ref")

                if(skill_ids_array[0]) {
                    queryBuilder.whereIn("skill_id_ref", skill_ids_array)
                }

                // if(skill_ids_array[0] != 0){
                //     this.andWhere(function() {
                //         queryBuilder.whereIn("first_skill_id", skill_ids_array)
                //         .orWhereIn("second_skill_id", skill_ids_array)
                //         // WHERE IN
                //     })
                // }
            })

        res.send(selectedExhibitions);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message}) // Something is very majorly wrong
    }
}
// ------------------------

// all functions must be exported
module.exports = {
    getAllExhibitions,
    getExhibitionsHomePage,
    getExhibitionsHomePageJSON,
    searchExhibitions,
};