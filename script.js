let devices = [];
let selectedDevice = null;


// ==============================
// ELEMENTS
// ==============================

let searchInput;
let deviceResults;
let resultBox;
let chargerWattage;
let compatibilityBox;


// ==============================
// HELPERS
// ==============================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normalize(text) {
    return String(text ?? "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}


function formatValue(value, suffix = "") {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "Unknown" ||
        value === "Not available"
    ) {
        return "Not available";
    }

    return `${value}${suffix}`;
}


// ==============================
// DEVICE SEARCH
// ==============================

function hideResults() {
    deviceResults.innerHTML = "";
}


function showResults(matches) {

    if (!matches.length) {

        deviceResults.innerHTML = `
            <div class="device-option">
                No matching device found.
            </div>
        `;

        return;
    }


    const visibleMatches = matches.slice(0, 30);


    deviceResults.innerHTML = visibleMatches
        .map((device, index) => {

            return `
                <div
                    class="device-option"
                    data-index="${index}"
                >

                    <div class="device-brand">
                        ${escapeHTML(device.brand)}
                    </div>

                    <div class="device-name">
                        ${escapeHTML(device.model)}
                    </div>

                </div>
            `;
        })
        .join("");


    deviceResults
        .querySelectorAll(".device-option[data-index]")
        .forEach(option => {

            option.addEventListener("click", () => {

                const index = Number(option.dataset.index);

                selectDevice(visibleMatches[index]);
            });

        });
}


function selectDevice(device) {

    selectedDevice = device;

    searchInput.value =
        `${device.brand} ${device.model}`;

    hideResults();

    showDevice(device);
}


function showDevice(device) {

    resultBox.classList.remove("hidden");


    const wattage =
        device.maxWattage !== null &&
        device.maxWattage !== undefined
            ? `${device.maxWattage} W`
            : "Not available";


    const voltage =
        device.voltage !== null &&
        device.voltage !== undefined
            ? `${device.voltage} V`
            : "Not available";


    const current =
        device.current !== null &&
        device.current !== undefined
            ? `${device.current} A`
            : "Not available";


    const battery =
        device.batteryCapacity !== null &&
        device.batteryCapacity !== undefined
            ? `${device.batteryCapacity} mAh`
            : "Not available";


    resultBox.innerHTML = `

        <h3>
            ${escapeHTML(device.brand)}
            ${escapeHTML(device.model)}
        </h3>


        <div class="spec-row">
            <strong>Category</strong>
            <span>
                ${escapeHTML(
                    formatValue(device.category)
                )}
            </span>
        </div>


        <div class="spec-row">
            <strong>Charging power</strong>
            <span>
                ${escapeHTML(wattage)}
            </span>
        </div>


        <div class="spec-row">
            <strong>Voltage</strong>
            <span>
                ${escapeHTML(voltage)}
            </span>
        </div>


        <div class="spec-row">
            <strong>Current</strong>
            <span>
                ${escapeHTML(current)}
            </span>
        </div>


        <div class="spec-row">
            <strong>Battery</strong>
            <span>
                ${escapeHTML(battery)}
            </span>
        </div>


        <div class="spec-row">
            <strong>Connector</strong>
            <span>
                ${escapeHTML(
                    formatValue(device.connector)
                )}
            </span>
        </div>


        <div class="spec-row">
            <strong>Charging protocol</strong>
            <span>
                ${escapeHTML(
                    formatValue(device.protocol)
                )}
            </span>
        </div>


        <div class="spec-row">
            <strong>Charging details</strong>
            <span>
                ${escapeHTML(
                    formatValue(device.chargingDetails)
                )}
            </span>
        </div>


        <div class="spec-row">
            <strong>Database status</strong>
            <span>
                ${
                    device.verified
                    ? "Verified"
                    : "Imported / not independently verified"
                }
            </span>
        </div>

    `;
}


// ==============================
// FIND DEVICE
// ==============================

function findBestDevice() {

    const query =
        normalize(searchInput.value);


    if (!query) {
        return null;
    }


    const exact =
        devices.find(device => {

            const fullName =
                normalize(
                    `${device.brand} ${device.model}`
                );

            const modelOnly =
                normalize(device.model);


            return (
                query === fullName ||
                query === modelOnly
            );
        });


    if (exact) {
        return exact;
    }


    return devices.find(device => {

        const fullName =
            normalize(
                `${device.brand} ${device.model}`
            );

        const modelOnly =
            normalize(device.model);


        return (
            fullName.includes(query) ||
            modelOnly.includes(query)
        );

    }) || null;
}


// ==============================
// COMPATIBILITY CHECKER
// ==============================

function checkCompatibility() {

    console.log("Compatibility button clicked");


    compatibilityBox.classList.remove("hidden");


    const charger =
        Number(chargerWattage.value);


    // Automatically find typed device
    if (!selectedDevice) {

        const typedDevice =
            findBestDevice();


        if (typedDevice) {
            selectDevice(typedDevice);
        }
    }


    // No device selected
    if (!selectedDevice) {

        compatibilityBox.innerHTML = `

            <h3>🟡 Select a device first</h3>

            <p>
                Search for your device above
                and click its name.
            </p>

        `;

        return;
    }


    // No charger selected
    if (
        !Number.isFinite(charger) ||
        charger <= 0
    ) {

        compatibilityBox.innerHTML = `

            <h3>🟡 Select your charger wattage</h3>

            <p>
                Choose the wattage of your charger
                and press the button again.
            </p>

        `;

        return;
    }


    const deviceWattage =
        Number(selectedDevice.maxWattage);


    // Database doesn't contain charging wattage
    if (
        !Number.isFinite(deviceWattage) ||
        deviceWattage <= 0
    ) {

        compatibilityBox.innerHTML = `

            <h3>🟡 Charging information unavailable</h3>

            <p>
                We found:

                <strong>
                    ${escapeHTML(selectedDevice.brand)}
                    ${escapeHTML(selectedDevice.model)}
                </strong>
            </p>

            <p>
                But the database does not currently
                contain a usable maximum charging wattage
                for this device.
            </p>

            <p>
                Charger wattage alone also cannot guarantee
                maximum charging speed.
            </p>

        `;

        return;
    }


    // Charger has enough wattage
    if (charger >= deviceWattage) {

        const wattageDifference =
            charger - deviceWattage;


        // High wattage warning
        // Trigger when charger is 60 W or more
        // above the device's maximum wattage
        if (wattageDifference >= 60) {

            compatibilityBox.innerHTML = `

                <h3>⚠️ High charger wattage</h3>

                <p>
                    Charger:
                    <strong>${charger} W</strong>
                </p>

                <p>
                    Device maximum:
                    <strong>${deviceWattage} W</strong>
                </p>

                <p>
                    The charger has
                    <strong>${wattageDifference} W</strong>
                    more power capacity than the device's
                    rated maximum.
                </p>

                <p>
                    A compatible charging protocol can prevent
                    the device from requesting more power than
                    it supports, but make sure the charger,
                    cable and charging protocol are compatible.
                </p>

                <p>
                    If the device becomes unusually hot while
                    charging, stop using the setup.
                </p>

            `;

            return;
        }


        // Charger is higher, but less than 60 W above device
        compatibilityBox.innerHTML = `

            <h3>🟡 Power capacity is sufficient</h3>

            <p>
                Charger:
                <strong>${charger} W</strong>
            </p>

            <p>
                Device maximum:
                <strong>${deviceWattage} W</strong>
            </p>

            <p>
                This means the charger has enough
                power capacity, but the actual charging
                speed also depends on protocol and cable.
            </p>

            <p>
                Device protocol:
                <strong>
                    ${escapeHTML(
                        formatValue(
                            selectedDevice.protocol
                        )
                    )}
                </strong>
            </p>

        `;

        return;
    }


    // Charger lower wattage
    compatibilityBox.innerHTML = `

        <h3>🟡 It should charge, but more slowly</h3>

        <p>
            Charger:
            <strong>${charger} W</strong>
        </p>

        <p>
            Device maximum:
            <strong>${deviceWattage} W</strong>
        </p>

        <p>
            The device may charge normally,
            but it is unlikely to reach its
            advertised maximum charging speed.
        </p>

    `;
}


// ==============================
// DATABASE
// ==============================

async function loadDatabase() {

    try {

        const response =
            await fetch(
                "devices.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        devices =
            await response.json();


        console.log(
            `Loaded ${devices.length} devices`
        );


    } catch (error) {

        console.error(
            "Database loading failed:",
            error
        );


        devices = [];
    }
}


// ==============================
// INITIALIZE
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        searchInput =
            document.getElementById(
                "deviceSearch"
            );

        deviceResults =
            document.getElementById(
                "deviceResults"
            );

        resultBox =
            document.getElementById(
                "result"
            );

        chargerWattage =
            document.getElementById(
                "chargerWattage"
            );

        compatibilityBox =
            document.getElementById(
                "compatibility"
            );


        // SEARCH
        searchInput.addEventListener(
            "input",
            () => {

                selectedDevice = null;

                const query =
                    normalize(searchInput.value);


                if (!query) {

                    hideResults();

                    resultBox.classList.add(
                        "hidden"
                    );

                    return;
                }


                const words =
                    query
                        .split(" ")
                        .filter(Boolean);


                const matches =
                    devices.filter(device => {

                        const fullName =
                            normalize(
                                `${device.brand} ${device.model}`
                            );


                        return words.every(
                            word =>
                                fullName.includes(word)
                        );
                    });


                showResults(matches);
            }
        );


        // ENTER KEY
        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    const device =
                        findBestDevice();


                    if (device) {
                        selectDevice(device);
                    }
                }

            }
        );


        // LOAD DATABASE
        loadDatabase();

    }
);