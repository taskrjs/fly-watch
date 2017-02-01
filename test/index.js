const {join} = require("path")
const {coroutine: co} = require("bluebird")
const touch = require("touch")
const test = require("tape")
const Fly = require("fly")

const fixtures = join(__dirname, "fixtures")

test("fly.watch", co(function * (t) {
	t.plan(17)

	const glob = join(fixtures, "*.js")
	const file = join(fixtures, "foo.js")
	const want = ["bar", "foo"]

	let val = 10
	let order = []

	const fly = new Fly({
		plugins: [
			require("../")
		],
		tasks: {
			* default(f, o) {
				t.true("watch" in f, "task runtime has access to `watch()`")
				yield f.watch(glob, want, o)
			},
			* foo(f, o) {
				order.push("foo")
				t.pass("execute tasks when `watch` starts")
				t.equal(o.val, val, "retain `serial` options behavior")
				return ++val
			},
			* bar(f, o) {
				order.push("bar")
				t.equal(o.val, val, "pass (initial) options to tasks on init")
				return ++val
			}
		}
	})

	fly.emit = function (e, obj) {
		if (e === "fly_watch") {
			t.pass("notify when `watch` starts")
		}

		if (e === "fly_watch_event") {
			t.pass("notify when `watch` events occur")
			t.equal(obj.action, "changed", "receive the correct event `type`")
			t.equal(obj.file, file, "receive the relevant `file` for given event")
		}
	}

	t.true("watch" in fly.plugins, "attach watch plugin to fly")

	yield fly.start("default", {val})
	t.deepEqual(order, want, "run `watch` task chain in `serial` mode")
	t.equal(val, 12, "truly `await` for chain completion")

	// reset
	order = []

	// hijack / overwrite tasks
	fly.tasks.foo.func = co(function * (f, o) {
		order.push("foo")
		t.equal(o.src, file, "(foo) receives new `src` key after `watch_event`")
		t.deepEqual(order, want, "re-run chain in correct order")

		t.true("prevs" in f._, "add the `prevs` key to task internals")
		t.true(Array.isArray(f._.prevs), "the `f._.prevs` key is an array")
		t.equal(f._.prevs[0], glob, "save the previous `glob` to `fly._.prevs`")

		// finished, force exit
		setTimeout(() => process.exit(0), 100)
	})

	fly.tasks.bar.func = co(function * (f, o) {
		order.push("bar")
		t.equal(o.src, file, "(bar) receives new `src` key after `watch_event`")
	})

	// force trigger
	setTimeout(() => touch(file), 100)
}))
