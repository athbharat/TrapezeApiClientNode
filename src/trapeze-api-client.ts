import * as req from "request";
import * as reqp from "request-promise-native";

export class TrapezeApiClient {
    private httpClient: req.RequestAPI<reqp.RequestPromise<any>, reqp.RequestPromiseOptions, req.UrlOptions>;
    public constructor(public readonly endpoint: string) {
        this.httpClient = reqp.defaults({
            headers: {
                "User-Agent": "Request-Promise",
            },
            json: true,
        });
    }

    public getVehicleLocations(): reqp.RequestPromise<any> {
        const options: req.OptionsWithUrl = {
            qs: {
                colorType: "ROUTE",
                positionType: "CORRECTED",
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/vehicleinfo/vehicles",
        };
        return this.httpClient
            .get(options);
    }
    public getRouteByTripId(vehicleId: string): reqp.RequestPromise<any> {
        const options: req.OptionsWithUrl = {
            qs: {
                id: vehicleId,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/pathinfo/trip",
        };
        return this.httpClient
            .post(options);
    }
    public getRouteByVehicleId(vehicleId: string): reqp.RequestPromise<any> {
        const options: req.OptionsWithUrl = {
            qs: {
                id: vehicleId,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/pathinfo/vehicle",
        };
        return this.httpClient
            .post(options);
    }

    public getTripPassages(tripId: string, mode: string) {
        const options: req.OptionsWithUrl = {
            form: {
                mode,
                tripId,
            },
            method: "POST",
            url: this.endpoint + "/internetservice/services/tripInfo/tripPassages",
        };
        return this.httpClient
            .post(options);
    }

}