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
                   TEST DOWNLOAD
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