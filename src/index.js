import Either from './Either';
import Action from './action/action';
import Identity from './Identity';
import IO from './IO';
import Maybe from './Maybe';
import Reader from './Reader';
import State  from './State';
import Tuple from './Tuple';

export default {
  Either,
  Action,
  Identity,
  IO,
  Maybe,
  Reader,
  State,
  Tuple,
  Future:Action
}
// module.exports = {
//   Action: require('./action/action'),
//   Future: require('./action/action'),
//   Identity: require('./Identity'),
//   IO: require('./IO'),
//   lift2: require('./lift2'),
//   lift3: require('./lift3'),
//   Maybe: require('./Maybe'),
//   Reader: require('./Reader'),
//   State: require('./State'),
//   Tuple: require('./Tuple'),
//   Futurize: require('futurize')
// };

