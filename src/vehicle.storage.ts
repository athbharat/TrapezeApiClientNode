import {
    IVehicleLocation,
    IVehicleLocationList,
} from "@donmahallem/trapeze-api-types";
import { LockHandler } from "./lock-handler";
import { TrapezeApiClient } from "./trapeze-api-client";

export enum Status {
    SUCCESS = 1,
    ERROR = 2,
}

export interface IBaseStatus {
    status: Status;
    timestamp?: number;
}

export interface IErrorStatus extends IBaseStatus {
    status: Status.ERROR;
    error: any;
}

export interface ISuccessStatus extends IBaseStatus {
    status: Status.SUCCESS;
    storage: Map<string, IVehicleLocation>;
    tripStorage: Map<string, IVehicleLocation>;
    lastUpdate: number;
}

export type LoadStatus = ISuccessStatus | IErrorStatus;

export class VehicleStorage {

    private lock: LockHandler = new LockHandler(false);
    private mStatus: LoadStatus;
    constructor(private trapezeClient: TrapezeApiClient, private updateDelay: number = 10000) { }

    public updateRequired(): boolean {
        if (this.status) {
            return this.status.timestamp + this.updateDelay < Date.now();
        }
        return true;
    }

    public get status(): LoadStatus {
        return this.mStatus;
    }

    public fetch(): Promise<LoadStatus> {
        if (this.updateRequired()) {
            return Promise.resolve(this.status);
        }
        if (this.lock.locked) {
            return this.lock.promise().then(() => this.status);
        }
        this.lock.locked = true;
        return this.trapezeClient.getVehicleLocations()
            .then((result: IVehicleLocationList): ISuccessStatus => {
                return this.convertResponse(result);
            }, (err: any): IErrorStatus => {
                const errorStatus: IErrorStatus = {
                    error: err,
                    status: Status.ERROR,
                };
                return errorStatus;
            })
            .then((loadStatus: LoadStatus): LoadStatus => {
                loadStatus.timestamp = Date.now();
                this.mStatus = loadStatus;
                this.lock.locked = false;
                return loadStatus;
            });
    }

    public convertResponse(result: IVehicleLocationList): ISuccessStatus {
        const loadStatus: ISuccessStatus = {
            status: Status.SUCCESS,
            storage: new Map(),
            tripStorage: new Map(),
            lastUpdate: result.lastUpdate,
        };
        for (const entry of result.vehicles) {
            if (entry === null) {
                continue;
            }
            if (entry.isDeleted === true) {
                continue;
            }
            const vehicleLocation: IVehicleLocation = entry as IVehicleLocation;
            loadStatus.storage.set(vehicleLocation.id, vehicleLocation);
            loadStatus.tripStorage.set(vehicleLocation.tripId, vehicleLocation);
        }
        return loadStatus;
    }

    public getVehicleByTripId(id: string): Promise<IVehicleLocation> {
        return this.fetch()
            .then((status: LoadStatus) => {
                if (status.status === Status.SUCCESS) {
                    if (status.tripStorage.has(id)) {
                        return Promise.resolve(status.tripStorage.get(id));
                    } else {
                        return Promise.reject(undefined);
                    }
                } else {
                    throw status.error;
                }
            });
    }
    public getVehicle(id: string): Promise<IVehicleLocation> {
        return this.fetch()
            .then((status: LoadStatus) => {
                if (status.status === Status.SUCCESS) {
                    if (status.storage.has(id)) {
                        return status.storage.get(id);
                    }
                    throw new Error("not found");
                }
                throw status.error;
            });
    }

    /**
     * @since 2.0.0
     * @param left 
     * @param right 
     * @param top 
     * @param bottom 
     */
    public getVehicles(left: number, right: number, top: number, bottom: number): Promise<IVehicleLocationList> {
        return this.fetch()
            .then((status: LoadStatus): IVehicleLocationList => {
                if (status.status === Status.SUCCESS) {
                    const vehicleList: IVehicleLocationList = {
                        vehicles: new Array(),
                        lastUpdate: status.lastUpdate,
                    };
                    for (const key of Array.from(status.storage.keys())) {
                        const vehicle: IVehicleLocation = status.storage.get(key);
                        if (vehicle.longitude < left || vehicle.longitude > right) {
                            continue;
                        } else if (vehicle.latitude > top || vehicle.latitude < bottom) {
                            continue;
                        } else {
                            vehicleList.vehicles.push(vehicle);
                        }
                    }
                    return vehicleList;
                }
                throw status.error;
            });
    }

}
