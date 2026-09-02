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

                const coverPage =
                    document.querySelector(".cover-page");

                if (!coverPage) {
                    alert("Cover page not found.");
                    return;
                }


                /*
                 * Temporarily make the cover visible to
                 * html2canvas for accurate rendering.
                 */

                const originalPosition =
                    coverPage.style.position;

                const originalWidth =
                    coverPage.style.width;


                coverPage.style.position = "relative";
                coverPage.style.width = "794px";


                const canvas =
                    await html2canvas(
                        coverPage,
                        {
                            scale: 2,
                            useCORS: true,
                            backgroundColor: "#ffffff"
                        }
                    );


                coverPage.style.position =
                    originalPosition;

                coverPage.style.width =
                    originalWidth;


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