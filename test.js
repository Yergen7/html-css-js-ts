"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const city = "Алматы";
const age = 25;
const isStudent = true;
const skills = ["Git", "TypeScript"];
const somearray = [4, 8, 15];
console.log(somearray);
const student = {
    name: "Айгерим",
    city,
    age,
    skills,
    university: "AGU",
};
function describe(s) {
    return `${s.name} из города ${s.city}`;
}
console.log(describe(student));
//# sourceMappingURL=test.js.map