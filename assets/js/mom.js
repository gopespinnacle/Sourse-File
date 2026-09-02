/* =========================================================
   GOPES PINNACLE ACADEMY
   MOM - PAGE LOGIC
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           DATE → DAY
        ================================================= */

        const dateInput =
            document.getElementById(
                "momDate"
            );

        const dayInput =
            document.getElementById(
                "momDay"
            );


        if (
            dateInput &&
            dayInput
        ) {

            dateInput.addEventListener(
                "change",
                () => {

                    if (!dateInput.value) {

                        dayInput.value = "";

                        return;

                    }


                    const date =
                        new Date(
                            dateInput.value +
                            "T00:00:00"
                        );


                    const day =
                        date.toLocaleDateString(
                            "en-US",
                            {
                                weekday:
                                    "long"
                            }
                        );


                    dayInput.value =
                        day;

                }
            );

        }

                /* =================================================
           DOWNLOAD MOM BUTTON
        ================================================= */

        const downloadBtn =
            document.getElementById(
                "downloadMomBtn"
            );

        if (downloadBtn) {

    downloadBtn.addEventListener(
        "click",
        async () => {

            try {

                const { jsPDF } = window.jspdf;

                if (!jsPDF) {
                    alert("PDF library is not loaded.");
                    return;
                }

                downloadBtn.disabled = true;
                downloadBtn.textContent = "CREATING PDF...";


                /* =========================================
                   COVER PAGE
                ========================================= */

                                /* =========================================
                   COVER PAGE
                ========================================= */

                const coverPage =
                    document.querySelector(".cover-page");

                if (!coverPage) {
                    alert("Cover page not found.");
                    return;
                }


                /* =========================================
                   CREATE PDF-SPECIFIC COVER COPY
                ========================================= */

                const pdfCover =
                    coverPage.cloneNode(true);


                /*
                 * Remove editable form controls and replace
                 * them with normal text elements.
                 * This prevents html2canvas from incorrectly
                 * rendering textarea/input content.
                 */

                const replaceField =
                    (selector, className) => {

                        const field =
                            pdfCover.querySelector(selector);

                        if (!field) {
                            return;
                        }

                        const value =
                            field.value || "";

                        const text =
                            document.createElement("div");

                        text.className =
                            className;

                        text.textContent =
                            value;

                        field.replaceWith(text);
                    };


                /* Date */

                const dateField =
                    pdfCover.querySelector("#momDate");

                if (dateField) {

                    let dateText = "";

                    if (dateField.value) {

                        const date =
                            new Date(
                                dateField.value +
                                "T00:00:00"
                            );

                        dateText =
                            date.toLocaleDateString(
                                "en-GB"
                            );

                    }

                    const text =
                        document.createElement("div");

                    text.className =
                        "pdf-cover-field-value";

                    text.textContent =
                        dateText;

                    dateField.replaceWith(text);

                }


                /* Day */

                replaceField(
                    "#momDay",
                    "pdf-cover-field-value"
                );


                /* Time */

                replaceField(
                    "#momTime",
                    "pdf-cover-field-value"
                );


                /* Teachers Present */

                const teachersField =
                    pdfCover.querySelector(
                        "#teachersPresent"
                    );

                if (teachersField) {

                    const teachersText =
                        teachersField.value || "";

                    const teachersBox =
                        document.createElement("div");

                    teachersBox.className =
                        "pdf-teachers-present-value";

                    teachersBox.innerHTML =
                        teachersText
                            .split(/\r?\n/)
                            .filter(
                                name =>
                                    name.trim() !== ""
                            )
                            .map(
                                name =>
                                    `<div>• ${name.trim()}</div>`
                            )
                            .join("");

                    teachersField.replaceWith(
                        teachersBox
                    );

                }


                /* Meeting Theme */

                const themeField =
                    pdfCover.querySelector(
                        "#meetingTheme"
                    );

                if (themeField) {

                    const themeText =
                        themeField.value || "";

                    const themeBox =
                        document.createElement("div");

                    themeBox.className =
                        "pdf-meeting-theme-value";

                    themeBox.textContent =
                        themeText;

                    themeField.replaceWith(
                        themeBox
                    );

                }


                /* =========================================
                   TEMPORARY PDF COVER CONTAINER
                ========================================= */

                pdfCover.style.width =
                    "794px";

                pdfCover.style.height =
                    "1123px";

                pdfCover.style.minHeight =
                    "0";

                pdfCover.style.boxSizing =
                    "border-box";

                pdfCover.style.overflow =
                    "hidden";

                pdfCover.style.position =
                    "fixed";

                pdfCover.style.left =
                    "-10000px";

                pdfCover.style.top =
                    "0";

                pdfCover.style.visibility =
                    "visible";

                pdfCover.style.background =
                    "#ffffff";


                document.body.appendChild(
                    pdfCover
                );


                /* =========================================
                   CAPTURE PDF COVER
                ========================================= */

                const canvas =
                    await html2canvas(
                        pdfCover,
                        {
                            scale: 2,
                            useCORS: true,
                            backgroundColor: "#ffffff",
                            logging: false
                        }
                    );


                /* Remove temporary cover */

                pdfCover.remove();


                /* =========================================
                   CREATE A4 PDF
                ========================================= */

                const pdf =
                    new jsPDF({
                        orientation: "portrait",
                        unit: "mm",
                        format: "a4"
                    });


                const pageWidth =
                    pdf.internal.pageSize.getWidth();

                const pageHeight =
                    pdf.internal.pageSize.getHeight();


                /*
                 * Keep the complete cover inside
                 * exactly ONE A4 page.
                 */

                const imageWidth =
                    pageWidth;

                const imageHeight =
                    (canvas.height / canvas.width) *
                    imageWidth;


                const finalHeight =
                    Math.min(
                        imageHeight,
                        pageHeight
                    );


                pdf.addImage(
                    canvas.toDataURL("image/png"),
                    "PNG",
                    0,
                    0,
                    imageWidth,
                    finalHeight
                );


                                /* =========================================
                   BODY OF MOM
                   AUTOMATIC A4 PAGINATION
                ========================================= */

                const bodyEditor =
                    document.getElementById(
                        "momBodyContent"
                    );


                if (!bodyEditor) {

                    alert("MOM body not found.");
                    return;

                }


                const bodyHTML =
                    bodyEditor.innerHTML.trim();


                /* =========================================
                   CREATE BODY PAGES ONLY IF CONTENT EXISTS
                ========================================= */

                if (bodyHTML) {

                    const paginationArea =
                        document.createElement("div");


                    paginationArea.style.position =
                        "fixed";

                    paginationArea.style.left =
                        "-10000px";

                    paginationArea.style.top =
                        "0";

                    paginationArea.style.width =
                        "794px";

                    paginationArea.style.background =
                        "#ffffff";

                    paginationArea.style.visibility =
                        "visible";


                    document.body.appendChild(
                        paginationArea
                    );


                    /* =====================================
                       A4 SETTINGS
                    ===================================== */

                    const PAGE_WIDTH = 794;
                    const PAGE_HEIGHT = 1123;

                    const PAGE_PADDING_TOP = 55;
                    const PAGE_PADDING_BOTTOM = 55;
                    const PAGE_PADDING_LEFT = 60;
                    const PAGE_PADDING_RIGHT = 60;


                    const CONTENT_HEIGHT =
                        PAGE_HEIGHT -
                        PAGE_PADDING_TOP -
                        PAGE_PADDING_BOTTOM;


                    let currentContent = null;
                    let pageNumber = 0;


                    /* =====================================
                       CREATE ONE A4 BODY PAGE
                    ===================================== */

                    function createBodyPage() {

                        pageNumber++;


                        const page =
                            document.createElement("div");


                        page.className =
                            "pdf-a4-body-page";


                        page.style.width =
                            PAGE_WIDTH + "px";

                        page.style.height =
                            PAGE_HEIGHT + "px";

                        page.style.boxSizing =
                            "border-box";

                        page.style.padding =
                            PAGE_PADDING_TOP +
                            "px " +
                            PAGE_PADDING_RIGHT +
                            "px " +
                            PAGE_PADDING_BOTTOM +
                            "px " +
                            PAGE_PADDING_LEFT +
                            "px";

                        page.style.background =
                            "#ffffff";

                        page.style.position =
                            "relative";

                        page.style.overflow =
                            "hidden";

                        page.style.border =
                            "1px solid #d1a044";


                        const content =
                            document.createElement("div");


                        content.style.width =
                            "100%";

                        content.style.height =
                            CONTENT_HEIGHT + "px";

                        content.style.boxSizing =
                            "border-box";

                        content.style.overflow =
                            "hidden";

                        content.style.fontFamily =
                            'Georgia, "Times New Roman", serif';

                        content.style.fontSize =
                            "18px";

                        content.style.lineHeight =
                            "1.8";


                        /* =================================
                           TITLE ON FIRST BODY PAGE
                        ================================= */

                        if (pageNumber === 1) {

                            const title =
                                document.createElement("div");


                            title.textContent =
                                "MINUTES OF MEETING";


                            title.style.textAlign =
                                "center";

                            title.style.fontFamily =
                                'Georgia, "Times New Roman", serif';

                            title.style.fontSize =
                                "25px";

                            title.style.fontWeight =
                                "bold";

                            title.style.letterSpacing =
                                "3px";

                            title.style.color =
                                "#14243b";

                            title.style.marginBottom =
                                "6px";


                            const subtitle =
                                document.createElement("div");


                            subtitle.textContent =
                                "GOPES PINNACLE ONLINE ACADEMY";


                            subtitle.style.textAlign =
                                "center";

                            subtitle.style.fontFamily =
                                'Georgia, "Times New Roman", serif';

                            subtitle.style.fontSize =
                                "14px";

                            subtitle.style.letterSpacing =
                                "2px";

                            subtitle.style.color =
                                "#c99732";

                            subtitle.style.marginBottom =
                                "25px";


                            content.appendChild(
                                title
                            );

                            content.appendChild(
                                subtitle
                            );

                        }


                        page.appendChild(
                            content
                        );


                        paginationArea.appendChild(
                            page
                        );


                        currentContent =
                            content;

                    }


                    /* =====================================
                       SOURCE CONTENT
                    ===================================== */

                    const source =
                        document.createElement("div");


                    source.innerHTML =
                        bodyHTML;


                    source.style.width =
                        "100%";


                    source.style.fontFamily =
                        'Georgia, "Times New Roman", serif';


                    source.style.fontSize =
                        "18px";


                    source.style.lineHeight =
                        "1.8";


                    /* =====================================
                       GET BODY BLOCKS
                    ===================================== */

                    const blocks = [];


                    Array.from(
                        source.childNodes
                    ).forEach(node => {

                        if (
                            node.nodeType ===
                            Node.TEXT_NODE
                        ) {

                            const text =
                                node.textContent.trim();


                            if (text) {

                                const paragraph =
                                    document.createElement(
                                        "p"
                                    );


                                paragraph.textContent =
                                    text;


                                blocks.push(
                                    paragraph
                                );

                            }

                        } else {

                            blocks.push(
                                node.cloneNode(true)
                            );

                        }

                    });


                    /* =====================================
                       CREATE FIRST PAGE
                    ===================================== */

                    if (!currentContent) {

                        createBodyPage();

                    }


                    /* =====================================
                       ADD BLOCKS
                    ===================================== */

                    for (
                        let i = 0;
                        i < blocks.length;
                        i++
                    ) {

                        const block =
                            blocks[i];


                        if (
                            !block.textContent.trim() &&
                            !block.innerHTML.trim()
                        ) {

                            continue;

                        }


                        const clone =
                            block.cloneNode(true);


                        clone.style.fontFamily =
                            'Georgia, "Times New Roman", serif';


                        clone.style.fontSize =
                            "18px";


                        clone.style.lineHeight =
                            "1.8";


                        clone.style.marginTop =
                            "0";


                        clone.style.marginBottom =
                            "14px";


                        clone.style.overflowWrap =
                            "break-word";


                        currentContent.appendChild(
                            clone
                        );


                        /* =================================
                           DOES IT FIT?
                        ================================= */

                        if (
                            currentContent.scrollHeight >
                            CONTENT_HEIGHT
                        ) {

                            currentContent.removeChild(
                                clone
                            );


                            createBodyPage();


                            currentContent.appendChild(
                                clone
                            );

                        }

                    }


                    /* =====================================
                       CONVERT BODY PAGES TO PDF
                    ===================================== */

                    const bodyPages =
                        Array.from(
                            paginationArea.querySelectorAll(
                                ".pdf-a4-body-page"
                            )
                        );


                    for (
                        let i = 0;
                        i < bodyPages.length;
                        i++
                    ) {

                        const bodyCanvas =
                            await html2canvas(
                                bodyPages[i],
                                {
                                    scale: 2,
                                    useCORS: true,
                                    backgroundColor:
                                        "#ffffff",
                                    logging: false,
                                    width:
                                        PAGE_WIDTH,
                                    height:
                                        PAGE_HEIGHT
                                }
                            );


                        pdf.addPage();


                        pdf.addImage(
                            bodyCanvas.toDataURL(
                                "image/png"
                            ),
                            "PNG",
                            0,
                            0,
                            210,
                            297
                        );

                    }


                    /* =====================================
                       REMOVE TEMPORARY BODY PAGES
                    ===================================== */

                    paginationArea.remove();

                }


                /* =========================================
                   FINAL DOWNLOAD
                ========================================= */

                pdf.save(
                    "Gopes-Pinnacle-Academy-MOM.pdf"
                );


                /* =========================================
                   FINAL DOWNLOAD
                ========================================= */

                pdf.save(
                    "Gopes-Pinnacle-Academy-MOM.pdf"
                );


            } catch (error) {

                console.error(
                    "MOM PDF ERROR:",
                    error
                );

                alert(
                    "Unable to create MOM PDF. Check console."
                );

            } finally {

                downloadBtn.disabled = false;
                downloadBtn.textContent = "DOWNLOAD MOM";

            }

        }
    );

}

    }
);