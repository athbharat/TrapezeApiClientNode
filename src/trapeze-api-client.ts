/*!
 * Source https://github.com/donmahallem/TrapezeApiClientNode
 */

import {
    ISettings,
    IStopInfo,
    IStopLocations,
    IStopPassage,
    IStopPointLocations,
    ITripPassages,
    IVehicleLocationList,
    IVehiclePathInfo,
    RouteId,
    StopId,
    TripId,
    VehicleId,
} from "@donmahallem/trapeze-api-types";
import * as req from "request";
import * as reqp from "request-promise-native";

export type StopMode = "arrival" | "departure";
export type PositionType = "CORRECTED" | "RAW";
export class TrapezeApiClient {
    private httpClient: req.RequestAPI<reqp.RequestPromise<any>, reqp.RequestPromiseOptions, req.UrlOptions>;
    /**
     *
     * @param endpoint
     * @since 1.0.0
     */
    public constructor(public readonly endpoint: string) {
        this.httpClient = reqp.defaults({
            headers: {
                "User-Agent": "Request-Promise: " + Math.random(),
            },
            json: true,
        });
    }

    /**
     * @since 1.0.0
     */
    /**
     * Correct
     * @param positionType coordinate type
     * @param lastUpdate timestamp of last update
     */
    public getVehicleLocations(positionType: PositionType = "CORRECTED",
                               lastUpdate?: string | number)
        : reqp.RequestPromise<IVehicleLocationList> {
        const options: req.OptionsWithUrl = {
            qs: {
                colorType: "ROUTE_BASED",
                lastUpdate,
                positionType,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/vehicleinfo/vehicles",
        };
        return this.httpClient
            .get(options);
    }
    /**
     *
     * @param tripId
     * @since 1.0.0
     */
    public getRouteByTripId(tripId: TripId): reqp.RequestPromise<IVehiclePathInfo> {
        const options: req.OptionsWithUrl = {
            qs: {
                id: tripId,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/pathinfo/trip",
        };
        return this.httpClient
            .post(options);
    }
    /**
     *
     * @param vehicleId
     * @since 1.0.0
     */
    public getRouteByVehicleId(vehicleId: VehicleId): reqp.RequestPromise<IVehiclePathInfo> {
        const options: req.OptionsWithUrl = {
            qs: {
                id: vehicleId,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/pathinfo/vehicle",
        };
        return this.httpClient
            .post(options);
    }

    /**
     *
     * @param routeId
     * @since 3.0.0
     */
    public getRouteByRouteId(routeId: RouteId, direction: string): reqp.RequestPromise<IVehiclePathInfo> {
        const options: req.OptionsWithUrl = {
            qs: {
                direction,
                id: routeId,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/pathinfo/route",
        };
        return this.httpClient
            .post(options);
    }

    /**
     *
     * @param top
     * @param bottom
     * @param left
     * @param right
     * @since 1.4.0
     */
    public getStopLocations(top: number = 324000000,
                            bottom: number = -324000000,
                            left: number = -648000000,
                            right: number = 648000000): reqp.RequestPromise<IStopLocations> {
        const options: req.OptionsWithUrl = {
            qs: {
                bottom,
                left,
                right,
                top,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/stopinfo/stops",
        };
        return this.httpClient.post(options);
    }

    /**
     *
     * @param top
     * @param bottom
     * @param left
     * @param right
     * @since 1.4.0
     */
    public getStopPointLocations(top: number = 324000000,
                                 bottom: number = -324000000,
                                 left: number = -648000000,
                                 right: number = 648000000): reqp.RequestPromise<IStopPointLocations> {
        const options: req.OptionsWithUrl = {
            qs: {
                bottom,
                left,
                right,
                top,
            },
            url: this.endpoint + "/internetservice/geoserviceDispatcher/services/stopinfo/stopPoints",
        };
        return this.httpClient.post(options);
    }
    /**
     *
     * @param tripId
     * @param mode
     * @since 1.0.0
     */
    public getTripPassages(tripId: TripId,
                           mode: StopMode): reqp.RequestPromise<ITripPassages> {
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

    /**
     *
     * @param stopId
     * @param mode
     * @param startTime milliseconds since epoch. now if undefined
     * @param timeFrame time frame from startTime in minutes
     * @since 2.3.0
     */
    public getStopPassages(stopId: StopId,
                           mode: StopMode = "departure",
                           startTime?: number,
                           timeFrame?: number): reqp.RequestPromise<IStopPassage> {
        const options: req.OptionsWithUrl = {
            form: {
                mode,
                startTime,
                stop: stopId,
                timeFrame,
            },
            url: this.endpoint + "/internetservice/services/passageInfo/stopPassages/stop",
        };
        return this.httpClient
            .post(options);
    }

    /**
     *
     * @param stopId
     * @param mode
     * @param startTime milliseconds since epoch. now if undefined
     * @param timeFrame time frame from startTime in minutes
     * @since 3.0.0
     */
    public getStopPointPassages(stopId: StopId,
                                mode: StopMode = "departure",
                                startTime?: number,
                                timeFrame?: number): reqp.RequestPromise<IStopPassage> {
        const options: req.OptionsWithUrl = {
            form: {
                mode,
                startTime,
                stop: stopId,
                timeFrame,
            },
            url: this.endpoint + "/internetservice/services/passageInfo/stopPassages/stopPoint",
        };
        return this.httpClient
            .post(options);
    }

    /**
     *
     * @param stopId
     * @param mode
     * @since 1.0.0
     */
    public getStopInfo(stopId: StopId,
                       mode: StopMode = "departure"): reqp.RequestPromise<IStopInfo> {
        const options: req.OptionsWithUrl = {
            form: {
                mode,
                stop: stopId,
            },
            url: this.endpoint + "/internetservice/services/stopInfo/stop",
        };
        return this.httpClient.post(options);
    }

    /**
     *
     * @param stopPointId
     * @param mode
     * @since 1.0.0
     */
    public getStopPointInfo(stopPointId: string,
                            mode: StopMode = "departure"): reqp.RequestPromise<any> {
        const options: req.OptionsWithUrl = {
            form: {
                mode,
                stopPoint: stopPointId,
            },
            url: this.endpoint + "/internetservice/services/stopInfo/stopPoint",
        };
        return this.httpClient.post(options);
    }
    /**
     * @since 1.3.0
     */
    public getSettings(): reqp.RequestPromise<ISettings> {
        const options: reqp.OptionsWithUrl = {
            transform: SettingsBodyTransformMethod,
            url: this.endpoint + "/internetservice/settings",
        };
        return this.httpClient.get(options);
    }

}

export const SettingsBodyTransformMethod = (body: string): ISettings => {
    const bracketStart: number = body.indexOf("{");
    const bracketEnd: number = body.lastIndexOf("}");
    if (bracketStart >= 0 && bracketEnd > bracketStart) {
        return JSON.parse(body.substring(bracketStart, bracketEnd + 1)) as ISettings;
    }
    throw new Error("non valid response body");
};
