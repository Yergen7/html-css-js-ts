const city: string = "Алматы";
const age: number = 25;
const isStudent: boolean = true;
const skills: string[] = ["Git", "TypeScript"];
const somearray: number[] = [4,8,15];
console.log(somearray);
type Student = {
  name: string;
  city: string;
  age: number;
  skills: string[];
  university: string;
};

const student: Student = {
  name: "Айгерим",
  city,
  age,
  skills,
  university: [AGU];
};

function describe(s: Student): string {
  return `${s.name} из города ${s.city}`;
}

console.log(describe(student));

