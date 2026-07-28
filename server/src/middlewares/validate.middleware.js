} catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = (error.errors || error.issues || []).map(e => ({
          field: e.path ? e.path.join('.') : '',
          message: e.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Error de validación en los datos enviados',
          errors: errorMessages,
        });
      }
      next(error);
    }
