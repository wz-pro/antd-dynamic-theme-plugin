import lessVars from '../lib/less-vars';
import path from 'path';

describe('less var to js', () => {
  test('get vars', async () => {
    const data = await lessVars(path.resolve(__dirname, './assets/theme.less'));
    expect(data).toEqual({
      'primary-color': 'red',
      'my-color': 'green',
      'color-test': 'gray',
    });
  });

  test('var from empty less', async () => {
    const empty = await lessVars(path.resolve(__dirname, './assets/empty.less'));
    expect(empty).toEqual({});
  });

  test('var from import', async () => {
    const files = ['light.less', 'dark.less', 'lessImport.less'];
    const [light, dark, lessImport] = await Promise.all(
      files.map((file) => lessVars(path.resolve(__dirname, `./assets/${file}`))),
    );
    expect(lessImport).toMatchObject(Object.assign(dark, light));
  });
});
