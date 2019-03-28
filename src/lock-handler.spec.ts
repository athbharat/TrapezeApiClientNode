import { expect } from "chai";
import "mocha";
import * as sinon from "sinon";
import { LockHandler } from "./lock-handler";

describe("lock-handler.ts", () => {
    describe("LockHandler", () => {
        const testUrl: string = "test.url";
        let instance: LockHandler;
        let sandbox: sinon.SinonSandbox;
        let getStub: sinon.SinonStub;
        let postStub: sinon.SinonStub;
        const testValue: any = {
            randomString: "randomString",
            test: 1,
        };
        before("create Sandbox", () => {
            sandbox = sinon.createSandbox();
            getStub = sandbox.stub();
            postStub = sandbox.stub();
        });
        beforeEach(() => {
            instance = new LockHandler();
            (instance as any).httpClient = {
                get: getStub,
                post: postStub,
            };
        });

        afterEach("clear history", () => {
            sandbox.resetHistory();
        });
        after(() => {
            sandbox.restore();
        });
        describe("currently the files arent locked", () => {
            it("should resolve directly if .locked is false", () => {
                instance.locked = false;
                return instance.promise()
                    .then(() => {
                        expect(true).to.equal(true);
                    });
            });
            it("should work with one lock", (done) => {
                instance.locked = true;
                instance.promise()
                    .then(() => {
                        done();
                    });
                setTimeout(() => {
                    instance.locked = false;
                }, 500);
            });
            it("should work with multiple locks", (done) => {
                instance.locked = true;
                Promise.all([instance.promise().then(() => {
                    return Date.now();
                }), instance.promise().then(() => {
                    return Date.now();
                }), instance.promise().then(() => {
                    return Date.now();
                })]).then((values: number[]) => {
                    const testTime: number = Date.now();
                    expect(values[0]).to.closeTo(testTime, 10);
                    expect(values[1]).to.closeTo(testTime, 10);
                    expect(values[2]).to.closeTo(testTime, 10);
                    done();
                }, done);
                setTimeout(() => {
                    instance.locked = false;
                }, 800);
            });
        });
    });
});
