const name = "Айгерим";
console.log(name);
let age = 25;
console.log(age);
age = age - 8;
console.log(age);

function greet(person) {
  return `Привет, ${person}!`;
}

const skills = ["HTML", "Git"];
console.log(skills);
skills.push("TypeScript");
console.log(skills);

const student = { name, age, skills };
console.log(student);

if (student.age >= 18) {
  console.log(greet(student.name));
} else {
  console.log(student.age);
}

const upper = skills.map((skill) => skill.toUpperCase());
console.log(upper);
console.log(name.toUpperCase());
console.log(name.toLowerCase());
console.log(skills[1].toLowerCase());
const shortNames = skills.filter((element) => element.length <= 4);
console.log(shortNames);