/*
=========================================
 SurgeWatch Flood Risk Engine™
 Version 1.0
=========================================
*/

function calculateFloodRisk(data) {

    const result = {

        rainfallScore: 0,
        floodplainScore: 0,
        riverScore: 0,
        alertScore: 0,
        elevationScore: 0,
        drainageScore: 5,

        totalScore: 0,
        readinessScore: 0,
        level: "LOW",

        breakdown: [],
        assessment: ""
    };



    // -----------------------------
    // Rainfall (0-30)
    // -----------------------------

    result.rainfallScore = Math.min(30, data.rainRisk || 0);



    // -----------------------------
    // FEMA Flood Zone (0-15)
    // -----------------------------

    switch ((data.floodZone || "").toUpperCase()) {

        case "VE":
            result.floodplainScore = 15;
            break;

        case "AE":
            result.floodplainScore = 12;
            break;

        case "AO":
            result.floodplainScore = 10;
            break;

        case "A":
            result.floodplainScore = 10;
            break;

        case "X":
            result.floodplainScore = 2;
            break;

        default:
            result.floodplainScore = 5;
    }



    // -----------------------------
    // River Gauge (0-15)
    // -----------------------------

    if ((data.gauge || "").toLowerCase().includes("flood")) {

        result.riverScore = 15;

    } else if ((data.gauge || "").toLowerCase().includes("above")) {

        result.riverScore = 10;

    } else {

        result.riverScore = 4;

    }



    // -----------------------------
    // NWS Alerts (0-20)
    // -----------------------------

    result.alertScore = Math.min(20, data.alertRisk || 0);



    // -----------------------------
    // Elevation (0-10)
    // -----------------------------

    const feet = data.elevationFeet || 0;

    if (feet < 20)
        result.elevationScore = 10;

    else if (feet < 100)
        result.elevationScore = 7;

    else if (feet < 500)
        result.elevationScore = 4;

    else
        result.elevationScore = 1;



    // -----------------------------
    // Total Score
    // -----------------------------

    result.totalScore =
        result.rainfallScore +
        result.floodplainScore +
        result.riverScore +
        result.alertScore +
        result.elevationScore +
        result.drainageScore;

    result.totalScore = Math.min(100, result.totalScore);

    result.readinessScore = 100 - result.totalScore;



    // -----------------------------
    // Risk Level
    // -----------------------------

    if (result.totalScore >= 80)
        result.level = "DANGEROUS";

    else if (result.totalScore >= 60)
        result.level = "HIGH";

    else if (result.totalScore >= 35)
        result.level = "WATCH";

    else
        result.level = "LOW";



    // -----------------------------
    // Score Breakdown
    // -----------------------------

    result.breakdown = [

        {
            label: "Rainfall",
            score: result.rainfallScore,
            max: 30
        },

        {
            label: "Floodplain",
            score: result.floodplainScore,
            max: 15
        },

        {
            label: "River Conditions",
            score: result.riverScore,
            max: 15
        },

        {
            label: "Weather Alerts",
            score: result.alertScore,
            max: 20
        },

        {
            label: "Elevation",
            score: result.elevationScore,
            max: 10
        },

        {
            label: "Drainage",
            score: result.drainageScore,
            max: 10
        }

    ];



    // -----------------------------
    // Engineering Assessment
    // -----------------------------

    if (result.totalScore < 35) {

        result.assessment =
            "Current conditions indicate a relatively low flood risk for the selected forecast window.";

    }

    else if (result.totalScore < 60) {

        result.assessment =
            "Some engineering factors indicate elevated flood potential. Continue monitoring changing conditions.";

    }

    else {

        result.assessment =
            "Multiple engineering indicators suggest a high flood risk. Monitor official warnings and be prepared to act.";

    }

    return result;

}
