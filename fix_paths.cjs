const { Project } = require("ts-morph");
const path = require("path");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const rootDir = path.resolve(__dirname);

let errors = 0;
for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    // Example bad path: E:/Coaching-Classes-main/src/pages/students/src/modules/student-management/pages/AddStudent.tsx
    // We want to extract the part after the second 'src/'
    
    // Normalize path to use forward slashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    const match = normalizedPath.match(/\/src\/.*?\/src\/(.*)$/);
    if (match) {
        const correctRelativePath = "src/" + match[1];
        const correctAbsolutePath = path.resolve(rootDir, correctRelativePath);
        const targetDir = path.dirname(correctAbsolutePath);
        
        console.log("Moving " + normalizedPath + " to " + targetDir);
        try {
            sourceFile.moveToDirectory(targetDir);
        } catch (e) {
            console.error("Failed to move " + normalizedPath, e);
            errors++;
        }
    }
}

if (errors === 0) {
    project.saveSync();
    console.log("Successfully fixed and saved project.");
} else {
    console.log("There were errors. Not saving.");
}
