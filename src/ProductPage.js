import ProductOptions from "./ProductOptions.js";
import Cart from "./Cart.js";
import { request } from "./api.js";

/** state 구조
 * {
 *  productId:1,
 *  product: Product,
 *  optionData: [],
 *  selectedOption: []
 * }
 */
export default function ProductPage({ $target, initialState }) {
  const $product = document.createElement("div");

  $target.appendChild($product);

  this.state = initialState;

  const productOptions = new ProductOptions({
    $target: $product,
    initialState: [],
    onSelect: (option) => {
      console.log(option);
    },
  });

  const cart = new Cart({
    $target: $product,
    initialState: {
      productName: "이디어츠 굿즈",
      basePrice: 10000,
      selectedOptions: [
        {
          optionName: "언제나 티셔츠",
          optionPrice: 10000,
          ea: 1,
        },
        {
          optionName: "로토 전용 피크 5개 세트",
          optionPrice: 500,
          ea: 3,
        },
      ],
    },
    onRemove: () => {},
  });

  this.setState = (nextState) => {
    if (nextState.productId !== this.state.productId) {
      fetchOptionData(nextState.productId);
      return;
    }

    this.state = nextState;
    productOptions.setState(this.state.optionData);
  };

  this.render = () => {};
  this.render();

  const fetchOptionData = (productId) => {
    return request(`/products/${productId}`)
      .then((product) => {
        this.setState({
          ...this.state,
          product,
          optionData: [],
        });
        return request(`product-options?product.id=${product.id}`);
      })
      .then((productOptions) => {
        return Promise.all([
          Promise.resolve(productOptions),
          Promise.all(
            productOptions
              .map((productOption) => productOption.id)
              .map((id) => {
                return request(`/product-option-stocks?productOption.id=${id}`);
              })
          ),
        ]);
      })
      .then((data) => {
        const [productOptions, stocks] = data;
        const optionData = productOptions.map((productOption, i) => {
          const stock = stocks[i][0].stock;

          return {
            optionId: productOption.id,
            optionName: productOption.optionName,
            optionPrice: productOption.optionPrice,
            stock,
          };
        });

        this.setState({
          ...this.state,
          optionData,
        });
      });
  };

  fetchOptionData(this.state.productId);
}
