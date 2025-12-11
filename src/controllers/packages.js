import {
    getAllPackagesService,
    getPackageByIdService,
    getPackagesAtAirportService,
    getPackagesOnboardService,
    loadPackage as loadPackageService,
    unloadPackage as unloadPackageService,
} from "../services/packageService.js";

export async function getPackages(req, res) {
    const { limit, page } = req.validatedQuery;
    res.json(await getAllPackagesService((page - 1) * limit, limit));
}

export async function getPackageById(req, res) {
    const pkg = await getPackageByIdService(req.params.id);
    if (!pkg) {
        return res.status(404).send("Package not found");
    }
    res.json(pkg);
}

export async function getPackagesAtAirport(req, res) {
    res.json(await getPackagesAtAirportService(req.params.airport));
}

export async function getPackagesOnboard(req, res) {
    res.json(await getPackagesOnboardService(req.params.id));
}

export async function loadPackage(req, res) {
    await loadPackageService(req.params.id, req.body.plane);
    res.status(200).json({ message: "Package loaded onto plane successfully" });
}

export async function unloadPackage(req, res) {
    await unloadPackageService(req.params.id);
    res.status(200).json({ message: "Package unloaded from plane successfully" });
}
