#!/usr/bin/env node

const fs = require('fs');

const program = require('commander');

const getPackageObject = (libraryName) => {
    return {
        "name": libraryName,
        "version": "1.0.0",
        "description": libraryName,
        "license": "ISC",
        "devDependencies": {
            "@angular/core": "*",
            "@angular/compiler": "*",
            "@angular/compiler-cli": "*",
            "rollup": "*",
            "rxjs": "*",
            "typescript": "*",
            "zone.js": "*"
        }
    }
}

const getSrcPackageObject = (libraryName) => {
    return {
        "name": libraryName,
        "version": "1.0.0",
        "license": "ISC",
        "module": libraryName + ".es5.js",
        "es2015": libraryName + ".js",
        "typings": libraryName + ".d.ts",
        "peerDependencies": {
            "@angular/core": "*",
            "rxjs": "*",
            "zone.js": "*"
        }
    }
}

const getTsConfigFile = () => {
    return {
        "compilerOptions": {
            "baseUrl": "./src",
            "experimentalDecorators": true,
            "moduleResolution": "node",
            "rootDir": "./src",
            "lib": ["es2015", "dom"],
            "skipLibCheck": true,
            "types": []
        }
    }
}

const getTsConfigBuildFile = (libraryName) => {
    return {
        "compilerOptions": {
            "declaration": true,
            "module": "es2015",
            "target": "es2015",
            "baseUrl": ".",
            "stripInternal": true,
            "experimentalDecorators": true,
            "emitDecoratorMetadata": true,
            "moduleResolution": "node",
            "outDir": "../build",
            "rootDir": ".",
            "lib": ["es2015", "dom"],
            "skipLibCheck": true,
            "types": []
        },
        "files": ["./index.ts"],
        "angularCompilerOptions": {
            "annotateForClosureCompiler": true,
            "strictMetadataEmit": true,
            "skipTemplateCodegen": true,
            "flatModuleOutFile": libraryName + ".js",
            "flatModuleId": libraryName
        }
    }
}

const getTsConfigEs5File = (libraryName) => {
    return {
        "compilerOptions": {
            "declaration": true,
            "module": "es2015",
            "target": "es5",
            "baseUrl": ".",
            "stripInternal": true,
            "experimentalDecorators": true,
            "moduleResolution": "node",
            "outDir": "../build",
            "rootDir": ".",
            "lib": ["es2015", "dom"],
            "skipLibCheck": true,
            "types": []
        },
        "files": [
            "./index.ts"
        ],
        "angularCompilerOptions": {
            "annotateForClosureCompiler": true,
            "strictMetadataEmit": true,
            "skipTemplateCodegen": true,
            "flatModuleOutFile": libraryName + ".js",
            "flatModuleId": libraryName
        }
    }
}

const getBuildScript = (libraryName) => {
    return '#!/usr/bin/env bash \n' +
        '#Clean up previous build \n' +
        'rm -rf dist  \n' +
        'rm -rf build \n' +
        '#Variable publishing to NGC \n' +
        'NGC="node node_modules/.bin/ngc" \n' +
        'ROLLUP="node node_modules/.bin/rollup" \n' +
        '#Run angular compiler \n' +
        '$NGC -p src/tsconfig-build.json \n' +
        '# Rollup ' + libraryName + '.js \n' +
        '$ROLLUP build/' + libraryName + '.js -o dist/' + libraryName + '.js -f es \n' +
        '# Repeat the process for es5 version \n' +
        '$NGC -p src/tsconfig-es5.json \n' +
        '$ROLLUP build/' + libraryName + '.js -o dist/' + libraryName + '.es5.js -f es \n' +
        '# Copy non-js files from build \n' +
        'rsync -a --exclude=*.js build/ dist \n' +
        'cp src/package.json dist/package.json'
}

const createLibraryFiles = (libraryName) => {
    try {
        fs.mkdirSync(libraryName);

        /**
         * Create package.json file
         */

        fs.writeFile('./' + libraryName + '/package.json', JSON.stringify(getPackageObject(libraryName)),
            'utf-8', function (err) {
            if (err) throw err;
        });

        /**
         * Create tsconfig.json file
         */
        fs.writeFile('./' + libraryName + '/tsconfig.json', JSON.stringify(getTsConfigFile()),
            'utf-8', function (err) {
                if (err) throw err;
        });

        /**
         * Create build.sh file
         */
        fs.writeFile('./' + libraryName + '/build.sh', getBuildScript(libraryName),
            'utf-8', function (err) {
                if (err) throw err;
            });

        fs.mkdirSync(libraryName + '/src');

        /**
         * Create src/package.json file
         */
        fs.writeFile('./' + libraryName + '/src/package.json', JSON.stringify(getSrcPackageObject(libraryName)),
            'utf-8', function (err) {
                if (err) throw err;
            });

        /**
         * Create src/tsconfig-build.json file
         */
        fs.writeFile('./' + libraryName + '/src/tsconfig-build.json', JSON.stringify(getTsConfigBuildFile(libraryName)),
            'utf-8', function (err) {
                if (err) throw err;
            });

        /**
         * Create src/tsconfig-es5.json file
         */
        fs.writeFile('./' + libraryName + '/src/tsconfig-es5.json', JSON.stringify(getTsConfigEs5File(libraryName)),
            'utf-8', function (err) {
                if (err) throw err;
            });

        /**
         * Create src/index.ts file
         */
        fs.writeFile('./' + libraryName + '/src/index.ts', '// exports all your modules here',
            'utf-8', function (err) {
                if (err) throw err;
            });

        console.info(libraryName + ' library successfully created');


    } catch(e) {
        if (e.code !== 'EXIST') {
            console.warn('Folder already exist')
        }
    }
};

program
    .version('0.0.1')
    .description('Library creator');

program
    .command('create-library <libraryName>')
    .alias('c')
    .description('Enter library name')
    .action((libraryName) => createLibraryFiles(libraryName));

program.parse(process.argv);