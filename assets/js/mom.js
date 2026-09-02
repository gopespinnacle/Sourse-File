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

    }
);