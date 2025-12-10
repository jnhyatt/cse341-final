import {
    getAllPackagesService,
    getPackageByIdService,
    getPackagesAtAirportService,
    getPackagesOnboardService,
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

export function loadPackage(req, res) {
    res.status(501).json({ message: "Not implemented yet" });
}

export function unloadPackage(req, res) {
    res.status(501).json({ message: "Not implemented yet" });
}
