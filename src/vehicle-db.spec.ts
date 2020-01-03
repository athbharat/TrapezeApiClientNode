/*!
 * Source https://github.com/donmahallem/TrapezeApiClientNode
 */

import { IVehicleLocationExtended } from "@donmahallem/trapeze-api-client-types";
import {
    IVehicleLocationList,
    TripId,
    VehicleId,
} from "@donmahallem/trapeze-api-types";
import { expect } from "chai";
import "mocha";
import * as sinon from "sinon";
import { VehicleDb } from "./vehicle-db";
/**
 * Helper method
 * @param ins
 * @param vehicles
 */
const setVehicles: (ins: VehicleDb, vehicles: Array<Partial<IVehicleLocationExtended>>) => void =
    (ins: VehicleDb, vehicles: any[]): void => {
        (ins as any).mVehicles = vehicles;
    };
describe("vehicle-db.ts", () => {
    describe("VehicleDb", () => {
        let instance: VehicleDb;
        let sandbox: sinon.SinonSandbox;
        let clock: sinon.SinonFakeTimers;
        const clockNowTimestamp: number = 123456;
        before("create Sandbox", () => {
            sandbox = sinon.createSandbox();
            clock = sandbox.useFakeTimers({
                now: clockNowTimestamp,
                shouldAdvanceTime: false,
            });
        });
        beforeEach(() => {
            instance = new VehicleDb();
        });

        afterEach("clear history", () => {
            sandbox.resetHistory();
        });
        after(() => {
            sandbox.restore();
            clock.restore();
        });
        const testVehiclesId: Array<Partial<IVehicleLocationExtended>> = [
            { id: "any id1" as VehicleId },
            { id: 2939 as VehicleId },
        ];
        const testVehiclesTripId: Array<Partial<IVehicleLocationExtended>> = [
            { tripId: "any id2" as TripId },
            { tripId: 2969 as TripId },
        ];
        describe("getVehicleById(id)", () => {
            it("should return undefined if no item is in the list", () => {
                setVehicles(instance, []);
                expect(instance.getVehicleById("id1" as VehicleId)).to.equal(undefined);
            });
            it("should return undefined if the queried id is unknown", () => {
                setVehicles(instance, testVehiclesId);
                expect(instance.getVehicleById("id1" as VehicleId)).to.equal(undefined);
            });
            testVehiclesId.forEach((val: Partial<IVehicleLocationExtended>) => {
                it("should return element with id '" + val.id + "' if the queried id is unknown", () => {
                    setVehicles(instance, testVehiclesId);
                    expect(instance.getVehicleById(val.id as VehicleId)).to.deep.equal(val);
                });
            });
        });
        describe("getVehicleByTripId(id)", () => {
            it("should return undefined if no item is in the list", () => {
                setVehicles(instance, []);
                expect(instance.getVehicleByTripId("id1" as TripId)).to.equal(undefined);
            });
            it("should return undefined if the queried id is unknown", () => {
                setVehicles(instance, testVehiclesTripId);
                expect(instance.getVehicleByTripId("id1" as TripId)).to.equal(undefined);
            });
            testVehiclesTripId.forEach((val: Partial<IVehicleLocationExtended>) => {
                it("should return element with tripId '" + val.tripId + "' if the queried id is unknown", () => {
                    setVehicles(instance, testVehiclesTripId);
                    expect(instance.getVehicleByTripId(val.tripId as TripId)).to.deep.equal(val);
                });
            });
        });
        describe("addResponse(resp)", () => {
            let addAllStub: sinon.SinonStub;
            let convertResponseStub: sinon.SinonStub;
            const testValue1: string = "test value 1";
            const testValue2: string = "test value 2";
            beforeEach(() => {
                addAllStub = sandbox.stub(instance, "addAll");
                convertResponseStub = sandbox.stub(instance, "convertResponse");
            });
            it("should call addAll with the result from convertResponse", () => {
                convertResponseStub.returns(testValue2);
                instance.addResponse(testValue1 as any);
                expect(addAllStub.callCount).to.equal(1, "addAll should only be called once");
                expect(convertResponseStub.callCount).to.equal(1, "convertResponse should only be called once");
                expect(addAllStub.calledWith(testValue2)).to.equal(true);
                expect(convertResponseStub.calledWith(testValue1)).to.equal(true);
            });
        });
        describe("convertResponse(result)", () => {
            const testData: IVehicleLocationList = {
                lastUpdate: 235236,
                vehicles: [
                    undefined,
                    // tslint:disable-next-line:no-null-keyword
                    null,
                    {
                        isDeleted: true,
                    },
                    {
                        id: "testId1",
                        latitude: 1,
                        tripId: "tripId1",
                    } as any,
                    {
                        id: "testId2",
                        longitude: 2,
                        tripId: "tripId2",
                    } as any,
                    {
                        id: "testId3",
                        latitude: 3,
                        longitude: 4,
                        tripId: "tripId3",
                    } as any,
                ],
            };
            it("should parse the items correctly", () => {
                const result: any[] = instance.convertResponse(testData);
                expect(result.length).to.equal(1);
                expect(result.every((value) => value.lastUpdate === 235236)).to.equal(true);
                expect(result).to.deep.equal([{
                    id: "testId3",
                    lastUpdate: 235236,
                    latitude: 3,
                    longitude: 4,
                    tripId: "tripId3",
                }]);
            });
        });
    });
});
