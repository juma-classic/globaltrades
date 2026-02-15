const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify').js;

const inputFile = path.join(__dirname, '../public/deriv-dtrader.vercel.app/js/core.maini.804607e2d73944397e19.js');
const outputFile = path.join(__dirname, '../public/deriv-dtrader.vercel.app/js/core.maini.804607e2d73944397e19.beautified.js');

console.log('Reading minified file...');
const minifiedCode = fs.readFileSync(inputFile, 'utf8');

console.log('Unminifying JavaScript...');
const beautifiedCode = beautify(minifiedCode, {
    indent_size: 2,
    space_in_empty_paren: true,
    max_preserve_newlines: 2,
    preserve_newlines: true,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'collapse',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: 0,
    indent_inner_html: false,
    comma_first: false,
    e4x: false,
    indent_empty_lines: false
});

console.log('Writing beautified file...');
fs.writeFileSync(outputFile, beautifiedCode, 'utf8');

console.log(`✅ Unminified file created: ${outputFile}`);
console.log(`Original size: ${(minifiedCode.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`Beautified size: ${(beautifiedCode.length / 1024 / 1024).toFixed(2)} MB`);
