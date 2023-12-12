const initPHPstructure = `<?php`;

const endPHPstructure = `
?>
`;

// html2 declaration
const stringHtml2 = `
    require_once('../includes/html2.php');
`;

// csv validation
const stringInitCsvValidation = `
    if (!isset($_GET['csvfile']) && !isset($_POST['selection'])) {
`;

// footer
const stringFooter = `
    require_once('../includes/footer.php');
`;

// endif
const stringEndCsvValidation = `
    }
`;

const convertToNearestPositiveAngle = (angle) => {
    if ((angle > 135 && angle <= 180) || (angle >= -180 && angle <= -135)) {
        return 180;
    } else if (angle > -45 && angle <= 45) {
        return 0;
    } else if (angle > 45 && angle <= 135) {
        return 270;
    } else {
        return 90;
    }
};

const hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {
        r: 0,
        g: 0,
        b: 0
    };
}

const getDefaultBarcodeValue = (barcodeType) => {
    switch (barcodeType) {
        case "UPC": return "123456789012";
        case "EAN13": return "9780521425575";
        case "EAN8": return "97805250";
        case "CODE39": return "1234567890";
        case "CODE128": return "1234567890";
        case "MSI": return "1234567890";
        default: return "";
    }
}

const generatePHP = (elements, format) => {
    let stringPHP = initPHPstructure;
    let upcCounter = 1;
 
    // filtering elements no qty
    const elementsNoQTY = elements.filter((element) => element.field !== "QTY");
    // filtering fields from canvas elements
    const filteredFields = elements.filter((element) => element.field);
    const filteredFieldsNoQTY = filteredFields.filter((element) => element.field !== "QTY");
    // fieldNames
    const fields = filteredFields.map((element) => element.field);
    // insert into fields at index 0 the QTY field if it does not exist
    if (!fields.includes("QTY")) {
        fields.unshift("QTY");
    }

    // label can be created if fields > 1
    if (fields.length <= 1) {
        alert("You cannot create a label with less than 1 field");
        return false;
    }

    // barcode existance verification
    const barcode = elements.find((element) => element.type === "barcode");
    const isBarcodeProvided = !!barcode;

    if (isBarcodeProvided) {
        fields.push("UPC");
    }

    // verify if there is only one barcode
    const hasOnlyOneBarcode = elements.filter((element) => element.type === "barcode").length > 0;
    if (!hasOnlyOneBarcode) {
        alert("You cannot create a label with more than 1 barcode");
        return false;
    }

    // verify if format dimensions have been set
    if (format.width && format.height) {
        if (format.width < 0 || format.height < 0) {
            alert("Width and height must be positive numbers");
            return false;
        }
    } else {
        alert("You must set the width and height of the label");
        return false;
    }

    /**
     * TODO: make adding a logo an easier task, add fonts from flashtrakv1
     */

    // correct fields declaration
    const stringCorrectos = `
    $correctos = array('`+ fields.join("', '") + `');
    `;

    stringPHP += stringCorrectos;
    stringPHP += stringHtml2;
    stringPHP += stringInitCsvValidation;

    // iterating over fields and create a variable for each one using the asignar function setting its default values
    const fieldVariables = filteredFieldsNoQTY.map((element, index) => {
        return `
        $`+ element.field + ` = asignar(${index + 1},'${element.state.text}');
        `;
    });
    stringPHP += fieldVariables.join("");

   // upc variable declaration and default value
    if (isBarcodeProvided) {
        // Verifica si hay elementos de tipo "barcode"
        const barcodeElements = elements.filter((element) => element.type === "barcode");

        // Utiliza map para generar un array de cadenas y luego únelas en una sola cadena
    const barcodeValues = barcodeElements.map((barcodeElement, index) => {
        return `
        $UPC${index + 1} = asignar(${filteredFieldsNoQTY.length + index + 1}, '${barcodeElement.barcodeValue}');
        `;
    });

        // Úne las cadenas con un salto de línea entre ellas
        stringPHP += barcodeValues.join('');
    }


    // rotation angle for the entire image
    format.angle = convertToNearestPositiveAngle(format.angle);
    if (format.angle !== 0 && format.angle !== null && format.angle !== undefined) {
        const stringAngulo = `
        $anguloDeRotacion = ${format.angle};
        `;
        stringPHP += stringAngulo;
    }
    
    // include comments with real width and height
    const stringWidthHeightComments = `
        // width: ${format.realWidth} in - height: ${format.realHeight} in
    `;
    stringPHP += stringWidthHeightComments;


    // format creation using formato function that receives ($width,$height,$bg_R,$bg_G,$bg_B,$angulo=0)
    const stringFormato = `
        formato(${format.width},${format.height},${format.color.r},${format.color.g},${format.color.b},${format.angle});
    `;
    stringPHP += stringFormato;

    const textsElements = elements.filter((element) => (element.type === "text" || element.type === "Checkbox") && element.field !== "QTY");
    // colors to use
    const colors = textsElements.map((element) => ({
        id: element.id,
        color: element.state.fill
    }));
    const rgbTextColors = colors.map((element, index) => ({
        id: element.id,
        index: index,
        color: hexToRgb(element.color)
    }));

    const stringColorVariables = rgbTextColors.map((element) => {
        return `
        $color${element.index} = color(${element.color.r}, ${element.color.g}, ${element.color.b});
        `;
    });
    stringPHP += stringColorVariables.join("");
    
    // fonts to use
    const fonts = textsElements.map((element) => ({
        id: element.id,
        font: element.state.fontFamily,
        file: element.state.fontFile
    }));

    const fontFiles = fonts.map((element, index) => ({
        id: element.id,
        index: index,
        file: (element.file !== "" && element.file !== null && element.file !== undefined) ? element.file : "arial.ttf"
    }));

    const stringFontVariables = fontFiles.map((element, index) => {
        return `
        $font${index} = fuente('${element.file}');
        `;
    });
    stringPHP += stringFontVariables.join("");

    // enter text data using texto function that receives ($value,$xPoint,$yPoint,$align,$leftMargin,$font,$color,$fontSize,$angle,$dollarSign,$showEmptyOnRed=TRUE
    // iterate over "elements" 
    const stringTextos = elementsNoQTY.map((element) => {
        if (element.type === "text" || element.type === "Checkbox") {
            // if element is type text then use texto function
            const x = Math.floor(element.state.x);
            const y = Math.floor(element.state.y) + Number(element.state.fontSize);
            const font = fontFiles.find((font) => font.id === element.id) ?? { index: 0 };
            const color = rgbTextColors.find((color) => color.id === element.id) ?? { index: 0 };
            const text = (element.field) ? `$${element.field}` : `'${element.state.text}'`;
            const width = Math.floor(element.state.width ?? 0);
            const height = Math.floor(element.state.height ?? 0);
            const fontSize = element.state.fontSize;
            const rotateAngle = convertToNearestPositiveAngle(element.state.rotation ?? 0);
            const dollarSign = 0;

            return `
            textoAjustado(${text},${x},${y},${width},${height},$font${font.index},$color${color.index},${fontSize},${rotateAngle},${dollarSign});
            `;
        } else if (element.type === "barcode") {
            // if element is barcode then use barcode function that receives ($value,$x,$y,$scale,$height,$barcodeType,$angle=0)
            // if barcodeDisplayValue is true we add barcodeTexto it needs ($textScale,$marginLeft,$marginTop,$guardBarsMargin,$fontFileName)
            const x = element.barcodeType === "ITF14" ? Math.floor(element.state.x) - 48 : Math.floor(element.state.x);
            const y = element.barcodeType === "ITF14" ? Math.floor(element.state.y) - 19 : Math.floor(element.state.y);
            const barcodeValue = `$UPC${upcCounter}`;
            const width = Math.floor(element.barcodeWidth ?? 2);
            const height = Math.floor(element.barcodeHeight ?? 100);
            const barcodeType = element.barcodeType ?? "UPC";
            const rotateAngle = convertToNearestPositiveAngle(element.state.rotation ?? 0);
            const barcodeDisplayValue = Number(element.barcodeDisplayValue ?? 0);
            const defaultBarcodeValue = getDefaultBarcodeValue(barcodeType);
            upcCounter++;
            return `
            barcodeAjustado(${barcodeValue},${x},${y},${width},${height},'${barcodeType}',${rotateAngle},'${defaultBarcodeValue}',${barcodeDisplayValue});
            `;
        } else if (element.type === "image") {
            // if element is an image then use the function setImageWithString which receives ($insertImg, $x, $y, $angle=0, $displayValue=1, $value=null)
            const x = Math.floor(element.state.x);
            const y = Math.floor(element.state.y);
            const width = Math.floor(element.state.width ?? 0);
            const height = Math.floor(element.state.height ?? 0);
            const rotateAngle = convertToNearestPositiveAngle(element.state.rotation ?? 0);
            const imgData = element.state.url.split(',')[1];
            return `
            setImageWithString(base64_decode("${imgData}"),${x},${y},${width},${height},${rotateAngle},0);
            `;
        }
        return "";
    });
    stringPHP += stringTextos.join("");
    

    stringPHP += stringFooter;
    stringPHP += stringEndCsvValidation;
    stringPHP += endPHPstructure;
    return stringPHP;
}


module.exports = {
    generatePHP,
}